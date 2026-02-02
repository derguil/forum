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

router.get('/reqUserActivity', async (req, res) => {
  const db = getDB("forumsData");
  const userId = req.session.userId;
  const tab = req.query.tab

  // console.log(tab)
  // posts
  // comments
  // scraps
  const currPage = Number(req.query.currPage);
  const limit = Number(req.query.limit);

  const skip = (currPage - 1) * limit

  let posts = [];
  let totalPostsCount = 0;

  switch (tab) {
    case "posts": {
      const result = await getPosts(userId, skip, limit)
      posts = result.posts
      totalPostsCount = result.totalPostsCount
      break
    }
    case "comments": {
      const result = await getComments(userId, skip, limit)
      posts = result.posts
      totalPostsCount = result.totalPostsCount
      break
    }
    case "scraps": {
      const result = await getScraps(userId, skip, limit)
      posts = result.posts
      totalPostsCount = result.totalPostsCount
      break
    }
  }

  async function getPosts(userId, skip, limit){
    const posts = await db.collection('posts').aggregate([
      { $match: 
        { 
          wby: new ObjectId(userId), isDeleted: false
        }
      },
      { $sort: { wtime: -1 } },
  
      { $skip: skip },
      { $limit: limit },
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
        { //lookup에서 필요한것만 가져오기로 성능 개선
          "written._id": 0,
          "written.profileImg": 0,
          "written.scrapPosts": 0,
          "written.email": 0,
          "written.passwordHash": 0,
          "written.createdAt": 0,
        }
      },
      { $lookup:
        {
          from: "forums",
          localField: "parent_id",
          foreignField: "_id",
          as: "forum"
        }
      },
      { $unwind:
        {
          path: "$forum"
        }
      },
      { $project:  
        {
          "forum._id": 0,
          "forum.madeby": 0
        }
      }
    ]).toArray();

    const totalPostsCount = await db.collection('posts').countDocuments(
      { wby: new ObjectId(userId), isDeleted: false }
    )
    
    return { posts, totalPostsCount }
  }

  async function getComments(userId, skip, limit){
    const comments = await db.collection("comments").find(
      { wby: new ObjectId(userId), isDeleted: false },
      { projection: { parent_id: 1 } }
    ).toArray();

    if (comments.length === 0) {
      return { posts: [], totalPostsCount: 0 };
    }
    const commentPostIds = [...new Set(comments.map(v => v.parent_id.toString()))].map(id => new ObjectId(id));

    const posts = await db.collection('posts').aggregate([
      { $match: { _id: { $in: commentPostIds } } },
      { $sort: { wtime: -1 } },
  
      { $skip: skip },
      { $limit: limit },
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
        { //lookup에서 필요한것만 가져오기로 성능 개선
          "written._id": 0,
          "written.profileImg": 0,
          "written.scrapPosts": 0,
          "written.email": 0,
          "written.passwordHash": 0,
          "written.createdAt": 0,
        }
      },
      { $lookup:
        {
          from: "forums",
          localField: "parent_id",
          foreignField: "_id",
          as: "forum"
        }
      },
      { $unwind:
        {
          path: "$forum"
        }
      },
      { $project:  
        {
          "forum._id": 0,
          "forum.madeby": 0
        }
      }
    ]).toArray();

    const totalPostsCount = commentPostIds.length
    
    return { posts, totalPostsCount }
  }

  async function getScraps(userId, skip, limit){
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { scrapPosts: 1 } }
    );

    const scrapPostIds = user?.scrapPosts ?? [];
    if (scrapPostIds.length === 0) {
      return { posts: [], totalPostsCount: 0 }; 
    }

    const posts = await db.collection("posts").aggregate([
      { $match: { _id: { $in: scrapPostIds } } },
      { $sort: { wtime: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "wby",
          foreignField: "_id",
          as: "written",
        }
      },
      { $unwind: "$written" },
      {
        $project: {
          "written._id": 0,
          "written.profileImg": 0,
          "written.scrapPosts": 0,
          "written.email": 0,
          "written.passwordHash": 0,
          "written.createdAt": 0,
        }
      },
      { $lookup:
        {
          from: "forums",
          localField: "parent_id",
          foreignField: "_id",
          as: "forum"
        }
      },
      { $unwind:
        {
          path: "$forum"
        }
      },
      { $project:  
        {
          "forum._id": 0,
          "forum.madeby": 0
        }
      }
    ]).toArray();

    const totalPostsCount = await db.collection('posts').countDocuments(
      { _id: { $in: scrapPostIds } }
    );

    return { posts, totalPostsCount };
  }

  res.send({ success: true, posts: posts, totalPostsCount: totalPostsCount });
});

router.get('/reqPosts', async (req, res) => {
  const db = getDB("forumsData");
  const forumid = req.query.forumid

  const currPage = Number(req.query.currPage);
  const limit = Number(req.query.limit);

  const skip = (currPage - 1) * limit

  const posts = await db.collection('posts').aggregate([
    { $match: { parent_id: new ObjectId(forumid), isDeleted: false }},
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
        "written._id": 0,
        "written.profileImg": 0,
        "written.scrapPosts": 0,
        "written.email": 0,
        "written.passwordHash": 0,
        "written.createdAt": 0,
      }
    }
  ]).toArray();
  const totalPostsCount = await db.collection('posts').countDocuments(
    { parent_id: new ObjectId(forumid), isDeleted: false }
  )
  res.send({ success: true, posts: posts, totalPostsCount: totalPostsCount });
});

router.get('/reqPost', async (req, res) => {
  const db = getDB("forumsData");
  const postid = req.query.postid;

  const [post] = await db.collection('posts').aggregate([
    { $match: { _id: new ObjectId(postid)}},
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

  const user_id = req.session.userId
  let isScrapped = false
  if(user_id){
    const sP = await db.collection('users').findOne(
      { _id: new ObjectId(user_id) },
      { projection:
        {
          "scrapPosts": 1
        }
      }
    )
    isScrapped = sP && sP.scrapPosts && sP.scrapPosts.some(id =>
      id.equals(new ObjectId(postid))
    );
  }else{
    isScrapped = false
  }

  res.send({ success: true, post: post, isScrapped: isScrapped });
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
    commentCount: 0,
    voteCount: 0,
    scrapCount: 0,
    updatedAt: new Date(),
    isDeleted: false,
    deletedAt: null,
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
  await db.collection('posts').updateOne(
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

  /////////////////////hard-delete//////////////////////////

  // if (post.images.length > 0) {
  //   for (const image of post.images) {
  //     try {
  //       await s3.send(new DeleteObjectCommand({
  //         Bucket: 'derguil-post-img',
  //         Key: image.img_key
  //       }));
  //     } catch (err) {
  //       console.error('S3 삭제 에러:', image.img_key, err);
  //     }
  //   }
  // }

  // await db.collection('posts').deleteOne({
  //   _id: new ObjectId(post_id),
  //   wby: new ObjectId(user_id),
  // });

  // await db.collection('comments').deleteMany({
  //   parent_id: new ObjectId(post_id),
  // });

  /////////////////////soft-delete/////////////////////////

  const postId = new ObjectId(post_id);

  // soft-delete the post (keep S3 images for possible recovery)
  await db.collection('posts').updateOne(
    { _id: postId, wby: new ObjectId(user_id) },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );

  // // soft-delete comments under the post
  // await db.collection('comments').updateMany(
  //   { parent_id: postId },
  //   { $set: { isDeleted: true, deletedAt: new Date() } }
  // );

  ///////////////////////////////////////////////

  res.send({ success: true });
});

router.post("/postVoteInc", requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { forum_id, post_id } = req.body;
  const userId = new ObjectId(req.session.userId);
  const forumId = new ObjectId(forum_id);
  const postId = new ObjectId(post_id);

  const today = new Date().toISOString().slice(0, 10);

  const already = await db.collection("postVotes").findOne({
    postId,
    userId,
    date: today,
  });

  if (already) {
    return res.status(400).json({
      success: false,
      message: "공감은 1일 1회만 가능합니다.",
    });
  }

  await db.collection("postVotes").insertOne({
    postId,
    userId,
    date: today,
    votedAt: new Date(),
  });  

  const { value: updatedPost } =
    await db.collection("posts").findOneAndUpdate(
      { _id: postId },
      { $inc: { voteCount: 1 } },
      { returnDocument: "after" }
    );
  
  if (updatedPost.voteCount >= 10) {
    await db.collection('rankings').updateOne(
      {
        forumType: "hot",
        forumId,
        postId
      },
      {
        $set: {
          score: updatedPost.voteCount,
          rankedAt: new Date()
        },
        $setOnInsert: {
          firstRankedAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  if (updatedPost.voteCount >= 100) {
    await db.collection('rankings').updateOne(
      {
        forumType: "best",
        forumId,
        postId
      },
      {
        $set: {
          score: updatedPost.voteCount,
          rankedAt: new Date()
        },
        $setOnInsert: {
          firstRankedAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  res.json({ success: true });
});

router.post("/addPostScrap", requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { post_id } = req.body;
  const userId = new ObjectId(req.session.userId);
  const postId = new ObjectId(post_id);

  await db.collection("users").updateOne(
    { _id: userId },
    {
      $addToSet: {
        scrapPosts: postId
      }
    }
  )

  await db.collection("posts").updateOne(
    { _id: postId },
    { $inc: { scrapCount: 1 } }
  )

  res.json({ success: true });
});

router.post("/delPostScrap", requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { post_id } = req.body;
  const userId = new ObjectId(req.session.userId);
  const postId = new ObjectId(post_id);

  const user = await db.collection("users").findOne({
    _id: userId,
    scrapPosts: postId,
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "이미 스크랩이 해제되었습니다.",
    });
  }

  await db.collection("users").updateOne(
    { _id: userId },
    {
      $pull: {
        scrapPosts: postId
      }
    }
  )

  await db.collection("posts").updateOne(
    { _id: postId },
    { $inc: { scrapCount: -1 } }
  )

  res.json({ success: true });
});

module.exports = router;