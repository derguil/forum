const express = require('express');
const router = express.Router();
const { ObjectId, Db } = require('mongodb');
const { getDB } = require('../mongoDb');
const requireLogin = require("../middlewares/requireLogin");

router.get('/reqThreads', requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const myIdObj = new ObjectId(req.session.userId);
  const myIdStr = String(req.session.userId);

  const threads = await db.collection("threads").aggregate([
    { $match: { members: myIdObj } },

    {
      $addFields: {
        otherUserId: {
          $first: {
            $filter: {
              input: "$members",
              as: "m",
              cond: { $ne: ["$$m", myIdObj] }
            }
          }
        },
        unread: {
          $ifNull: [
            {
              $getField: {
                field: myIdStr,
                input: "$unreadCount"
              }
            },
            0
          ]
        }
      }
    },

    { $lookup: { from: "users", localField: "otherUserId", foreignField: "_id", as: "otherUser" } },
    { $unwind: "$otherUser" },

    {
      $project: {
        "otherUser.passwordHash": 0,
        "otherUser.email": 0,
        "otherUser.createdAt": 0,
      }
    },

    { $sort: { updatedAt: -1 } }
  ]).toArray();

  res.json({ success: true, threads });
});


router.post('/threads', requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const post_id = req.body.post_id
  const sent_id = req.session.userId

  const post = await db.collection("posts").findOne({
    _id: new ObjectId(post_id)
  });

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  const rec_id = post.wby;

  if (sent_id == rec_id) {
    return res.status(400).json({ message: "본인에게는 쪽지를 보낼 수 없습니다." });
  }

  const exist = await db.collection("threads").findOne({
    post_id: new ObjectId(post_id),
    members: { $all: [new ObjectId(sent_id), new ObjectId(rec_id)] }
  });

  if (exist) {
    return res.json({ threadId: exist._id, isNew: false });
  }

  const result = await db.collection("threads").insertOne({
    forum_id: new ObjectId(post.parent_id),
    post_id: new ObjectId(post._id),

    members: [
      new ObjectId(sent_id),
      new ObjectId(rec_id)
    ],

    unreadCount: {
      [sent_id]: 0,
      [rec_id]: 0
    },

    lastMessage: null,

    createdAt: new Date(),
    updatedAt: new Date()
  });

  return res.json({ threadId: result.insertedId, isNew: true });
})

router.get('/reqMessages', requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const thread_id = req.query.threadid;
  const userId = new ObjectId(req.session.userId);

  await db.collection("threads").updateOne(
    {
      _id: new ObjectId(thread_id),
      members: new ObjectId(userId)
    },
    {
      $set: {
        [`unreadCount.${userId}`]: 0
      }
    }
  );

  const threadChats = await db.collection("messages")
    .find({
      thread_id: new ObjectId(thread_id),
    })
    .sort({ createdAt: 1 })
    .toArray();

  const shaped = threadChats.map(Chats => ({
    ...Chats,
    type: Chats.sent?.toString() === userId.toString() ? "me" : "other"
  }));

  res.json({ success: true, threadChats: shaped });
});

router.post('/sendMessage', requireLogin, async (req, res) => {
  const db = getDB("forumsData");
  const { threadid, text, otherUserId } = req.body;
  const sent_id = new ObjectId(req.session.userId);

  if (!threadid || !text) {
    return res.status(400).json({ success: false });
  }

  const newMessage = {
    thread_id: new ObjectId(threadid),
    text,
    sent: sent_id,
    createdAt: new Date(),
    type: "me"
  };

  await db.collection("messages").insertOne(newMessage);

  await db.collection("threads").updateOne(
    { _id: new ObjectId(threadid) },
    {
      $set: {
        lastMessage: text,
        updatedAt: new Date()
      },
      $inc: {
        [`unreadCount.${otherUserId}`]: 1
      }
    }
  );

  res.json({
    success: true,
    message: {
      ...newMessage
    }
  });
});


module.exports = router;