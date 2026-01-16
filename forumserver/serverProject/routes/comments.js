const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../mongoDb');
const requireLogin = require("../middlewares/requireLogin");

router.get('/reqComments', async (req, res) => {
  const db = getDB("forumsData");
  const postid = req.query.postid;

  const comments = await db.collection('comments').aggregate([
    { $match: { parent_id: new ObjectId(postid) }},
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
        "written.createdAt": 0
      }
    }
  ]).toArray();

  res.send({ success: true, comments: comments });
});

router.post('/writeComment', requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { parent_id, comment } = req.body;
  const user_id = req.session.userId

  await db.collection('comments').insertOne({
    parent_id: new ObjectId(parent_id),
    comment,
    wtime: new Date(),
    wby: new ObjectId(user_id)
  });

  await db.collection('posts').updateOne(
    { _id: new ObjectId(parent_id) },
    {
      $inc: { commentCount: 1 }
    }
  );

  res.send({ success: true });
});

router.delete('/comment', requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { comment_id, postid } = req.query;

  await db.collection('comments').deleteOne({
    _id: new ObjectId(comment_id)
  });

  await db.collection('posts').updateOne(
    { _id: new ObjectId(postid) },
    {
      $inc: { commentCount: -1 }
    }
  );


  res.send({ success: true });
})
 
module.exports = router;
