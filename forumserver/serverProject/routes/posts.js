const express = require('express');
const router = express.Router();
const path = require("path");
const { ObjectId } = require('mongodb');
const { getDB } = require('../mongoDb');
const requireLogin = require("../middlewares/requireLogin");

const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { randomUUID } = require("crypto");

const s3 = new S3Client({
  region : 'ap-northeast-2',
  credentials : {
    accessKeyId : process.env.S3_key,
    secretAccessKey : process.env.S3_private_key
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'derguil-post-img',
    key: function (req, file, cb) {
      cb(null, `${randomUUID()}${path.extname(file.originalname)}`); //filename
    }
  })
})

router.get('/reqPosts', async (req, res) => {
  const db = getDB("forumsData");
  const forumid = req.query.forumid

  const currPage = Number(req.query.currPage);
  const limit = Number(req.query.limit);

  const skip = (currPage - 1) * limit

  const posts = await db.collection('posts').aggregate([
    { $match: { parent_id: new ObjectId(forumid) }},
    { $sort: { wtime: -1 } },

    { $skip: skip },
    { $limit: limit },
    { $lookup:  //https://www.mongodb.com/ko-kr/docs/manual/reference/operator/aggregation/lookup/
      {
        from: "users",
        localField: "wby",
        foreignField: "_id",
        as: "written"
      }
    },
    { $unwind:  //https://www.mongodb.com/ko-kr/docs/manual/reference/operator/aggregation/lookup/#std-label-lookup-multiple-joins
      {
        path: "$written"
      }
    },
    { $project:  //https://www.mongodb.com/ko-kr/docs/manual/reference/operator/aggregation/project/#std-label-remove-example
      { //lookup에서 필요한것만 가져오기로 성능 개선
        "written.email": 0,
        "written.passwordHash": 0,
        "written.createdAt": 0,
      }
    }
  ]).toArray();
  const totalPostsCount = await db.collection('posts').countDocuments(
    { parent_id: new ObjectId(forumid) }
  )

  res.send({ success: true, posts: posts, totalPostsCount: totalPostsCount });
});

router.get('/reqPost', async (req, res) => {
  const db = getDB("forumsData");
  const postid = req.query.postid;

  const [post] = await db.collection('posts').aggregate([
    { $match: { _id: new ObjectId(postid) }},
    { $lookup:
      {
        from: "users",
        localField: "wby",
        foreignField: "_id",
        as: "written"
      }
    },
    { $unwind:
      {
        path: "$written"
      }
    },
    { $project:
      {
        "written.email": 0,
        "written.passwordHash": 0,
        "written.createdAt": 0,
      }
    }
  ]).toArray();
  res.send({ success: true, post: post });
});

router.post('/writePost', requireLogin, upload.array("images", 20), async (req, res) => {
  const db = getDB("forumsData");
  const user_id = req.session.userId
  const { parent_id, title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "title/content 누락" });
  }

  const parantForum = await db.collection('forums').findOne({
    _id: new ObjectId(parent_id)
  })

  if(!parantForum) {
    return res.status(500).json({ message: "존재하지 않는 forum!" });
  }

  const images = (req.files || []).map(file => ({
    img_key: file.key,
    img_URL: file.location,
  }));

  await db.collection('posts').insertOne({
    parent_id: new ObjectId(parent_id),
    title,
    content,
    images,
    wtime: new Date(),
    wby: new ObjectId(user_id),
    commentCount: 0
  });

  res.send({ success: true });
});

router.post("/editPost", requireLogin, upload.array("images", 20), async (req, res) => {
  const db = getDB("forumsData");
  const user_id = req.session.userId;
  const { parent_id, post_id, title, content } = req.body;
  if (!post_id || !title || !content) {
    return res.status(400).json({ message: "postid/title/content 누락" });
  }
  let keepOldImages = [];
  let removedOldKeys = [];

  try {
    keepOldImages = req.body.keepOldImages ? JSON.parse(req.body.keepOldImages) : [];
    removedOldKeys = req.body.removedOldKeys ? JSON.parse(req.body.removedOldKeys) : [];
  } catch (e) {
    return res.status(400).json({ message: "keepOldImages/removedOldKeys JSON 파싱 실패" });
  }

  const newUploadedImages = (req.files || []).map(file => ({
    img_key: file.key,
    img_URL: file.location,
  }));

  const finalImages = [...keepOldImages, ...newUploadedImages];
  await db.collection("posts").updateOne(
    { _id: new ObjectId(post_id), wby: new ObjectId(user_id) },
    {
      $set: {
        title,
        content,
        images: finalImages,
        updatedAt: new Date(),
      },
    }
  );

  for (const key of removedOldKeys) {
    if (!key) continue;
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: "derguil-post-img",
        Key: key,
      }));
    } catch (err) {
      console.error("S3 삭제 실패:", key, err);
    }
  }

  return res.json({
    success: true,
    message: "수정 완료"
  });
});

router.delete('/post', requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { post_id } = req.query;
  const user_id = req.session.userId;

  const post = await db.collection('posts').findOne({
    _id: new ObjectId(post_id),
    wby: new ObjectId(user_id),
  });

  if (!post) {
    return res.status(403).send({ message: "삭제 권한이 없습니다." });
  }

  if (post.images.length > 0) {
    for (const image of post.images) {
      try {
        await s3.send(new DeleteObjectCommand({
          Bucket: 'derguil-post-img',
          Key: image.img_key
        }));
      } catch (err) {
        console.error('S3 삭제 에러:', image.img_key, err);
      }
    }
  }

  await db.collection('posts').deleteOne({
    _id: new ObjectId(post_id),
    wby: new ObjectId(user_id),
  });

  await db.collection('comments').deleteMany({
    parent_id: new ObjectId(post_id),
  });

  res.send({ success: true });
});


module.exports = router;