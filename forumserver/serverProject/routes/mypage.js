const express = require("express");
const router = express.Router();
const path = require("path");
const { ObjectId } = require("mongodb");
const { getDB } = require("../mongoDb");
const requireLogin = require("../middlewares/requireLogin");
const bcrypt = require("bcrypt");

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { randomUUID } = require("crypto");

const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.S3_key,
    secretAccessKey: process.env.S3_private_key,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "derguil-profile-img",
    key: function (req, file, cb) {
      cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
    },
  }),
});

const DEFAULT_PROFILE_IMG = {
  img_key: "6e119ef1-b710-47a4-ba3e-181439671110.png",
  img_URL:
    "https://derguil-profile-img.s3.ap-northeast-2.amazonaws.com/6e119ef1-b710-47a4-ba3e-181439671110.png",
};

function logout(req, res, message = "로그아웃 완료") {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "로그아웃 실패" });
    res.clearCookie("connect.sid");
    res.json({ message });
  });
}

router.get("/mypage", requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const userid = req.session.userId;

  const user = await db.collection("users").findOne({
    _id: new ObjectId(userid),
  });

  if (!user) return res.status(404).json({ message: "유저 정보를 찾을 수 없습니다" });

  res.json({
    username: user.username,
    email: user.email,
    profileImg: user.profileImg,
  });
});

router.put("/chusername", requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { username } = req.body;
  const userId = req.session.userId;

  if (!username) return res.status(400).json({ message: "아이디가 필요합니다" });

  const exists = await db.collection("users").findOne({ username });
  if (exists) return res.status(409).json({ message: "이미 사용 중인 아이디" });

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { username } }
  );

  res.json({ message: "아이디 변경 완료" });
});

router.put("/chemail", requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { email } = req.body;
  const userId = req.session.userId;

  if (!email) return res.status(400).json({ message: "email이 필요합니다" });

  const exists = await db.collection("users").findOne({ email });
  if (exists) return res.status(409).json({ message: "이미 사용 중인 이메일" });

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { email } }
  );

  res.json({ message: "email 변경 완료" });
});

router.put(
  "/chprofileimg",
  requireLogin,
  upload.single("profileImg"),
  async (req, res) => {
    const db = getDB("forumsData");
    const userId = req.session.userId;

    if (!req.file) {
      return res.status(400).json({ message: "프로필 이미지가 필요합니다" });
    }

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { profileImg: 1 } }
    );

    const oldKey = user?.profileImg?.img_key;

    const newProfileImg = {
      img_key: req.file.key,
      img_URL: req.file.location,
    };

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { profileImg: newProfileImg } }
    );

    const shouldDeleteOld =
      oldKey &&
      oldKey !== DEFAULT_PROFILE_IMG.img_key &&
      oldKey !== newProfileImg.img_key;

    if (shouldDeleteOld) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: "derguil-profile-img",
            Key: oldKey,
          })
        );
      } catch (err) {
        console.error("기존 프로필 이미지 S3 삭제 실패:", err);
      }
    }

    res.json({ message: "프로필 사진 변경 완료", profileImg: newProfileImg });
  }
);

router.put("/chpassword", requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { currentPassword, newPassword } = req.body;
  const userId = req.session.userId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "비밀번호 정보가 필요합니다" });
  }

  const user = await db.collection("users").findOne({
    _id: new ObjectId(userId),
  });

  if (!user) return res.status(404).json({ message: "유저를 찾을 수 없습니다" });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "현재 비밀번호가 틀렸습니다" });

  const newHash = await bcrypt.hash(newPassword, 10);

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { passwordHash: newHash } }
  );

  logout(req, res, "비밀번호 변경 완료. 다시 로그인하세요.");
});

module.exports = router;
