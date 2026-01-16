const express = require("express");
const router = express.Router();
const { getDB } = require("../mongoDb");
const { ObjectId } = require("mongodb");
const requireLogin = require("../middlewares/requireLogin");
const bcrypt = require("bcrypt");

const DEFAULT_PROFILE_IMG = {
  img_key: "6e119ef1-b710-47a4-ba3e-181439671110.png",
  img_URL:
    "https://derguil-profile-img.s3.ap-northeast-2.amazonaws.com/6e119ef1-b710-47a4-ba3e-181439671110.png",
};

router.get("/me", requireLogin, (req, res) => {
  res.json({ user: req.session.userId || null });
});

router.post("/register", async (req, res) => {
  const db = getDB("forumsData");
  const { username, email, password, password2 } = req.body;

  if (!username || !email || !password || !password2)
    return res.status(400).json({ message: "필수값 누락" });

  if (password != password2)
    return res.status(400).json({ message: "확인 비번 불일치" });

  const exists = await db.collection("users").findOne({ username });
  if (exists) return res.status(409).json({ message: "이미 존재하는 아이디" });

  const passwordHash = await bcrypt.hash(password, 10);

  await db.collection("users").insertOne({
    username,
    email,
    profileImg: {
      img_key: DEFAULT_PROFILE_IMG.img_key,
      img_URL: DEFAULT_PROFILE_IMG.img_URL,
    },
    passwordHash,
    createdAt: new Date(),
  });

  res.json({ message: "회원가입 완료" });
});

router.post("/login", async (req, res) => {
  const db = getDB("forumsData");
  const { username, password } = req.body;

  const user = await db.collection("users").findOne({ username });
  if (!user) return res.status(401).json({ message: "존재하지 않는 아이디" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "비밀번호가 틀렸습니다" });

  req.session.userId = user._id.toString(); //serializeUser
  res.json({ message: "로그인 성공" });
});

router.post("/logout", requireLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "로그아웃 실패" });
    res.clearCookie("connect.sid");
    res.json({ message: "로그아웃 완료" });
  });
});

module.exports = router;