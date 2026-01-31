const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../mongoDb');

router.get('/reqTrendPosts', async (req, res) => {
  const db = getDB("forumsData");

  const trendposts = await db.collection('trends').aggregate([
    { $replaceRoot: { newRoot: "$post" } },
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
  res.send({ success: true, trendposts });
});

router.get('/reqHotPosts', async (req, res) => {
  const db = getDB("forumsData");
  const currPage = Number(req.query.currPage);
  const limit = Number(req.query.limit);

  const skip = (currPage - 1) * limit

  const posts = await db.collection('rankings').aggregate([
    { 
      $match: {
        forumType: "hot"
      }
    },
    { $sort: { firstRankedAt: -1 } },

    { $skip: skip },
    { $limit: limit },

    {
      $lookup: { //두 조건(postId,forumId) 이상 lookup pipeline 사용?
        from: "posts",
        localField: "postId",
        foreignField: "_id",
        as: "hotPost"
      }
    },
    { $unwind: "$hotPost" },
    { $replaceRoot: { newRoot: "$hotPost" } },
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

  const totalPostsCount = await db.collection('rankings').countDocuments(
    { forumType: "hot" }
  )

  res.send({ success: true, posts: posts, totalPostsCount: totalPostsCount });
});

router.get('/reqBestPosts', async (req, res) => {
  const db = getDB("forumsData");
  const currPage = Number(req.query.currPage);
  const limit = Number(req.query.limit);

  const skip = (currPage - 1) * limit

  const posts = await db.collection('rankings').aggregate([
    { 
      $match: {
        forumType: "best"
      }
    },
    { $sort: { firstRankedAt: -1 } },

    { $skip: skip },
    { $limit: limit },

    {
      $lookup: { //두 조건(postId,forumId) 이상 lookup pipeline 사용?
        from: "posts",
        localField: "postId",
        foreignField: "_id",
        as: "bestPost"
      }
    },
    { $unwind: "$bestPost" },
    { $replaceRoot: { newRoot: "$bestPost" } },
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

  const totalPostsCount = await db.collection('rankings').countDocuments(
    { forumType: "best" }
  )

  res.send({ success: true, posts: posts, totalPostsCount: totalPostsCount });
});

module.exports = router;