const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../mongoDb');

router.post('/threads', async (req, res) => {
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

  const thread = await db.collection("threads").findOne({
    post_id: new ObjectId(post_id),
    members: { $all: [new ObjectId(sent_id), new ObjectId(rec_id)] }
  });
  if (thread) {
    return res.json({ threadId: thread._id, isNew: false });
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

router.get('/reqThreads', async (req, res) => {
  const db = getDB("forumsData");
  const myId = req.session.userId;

  const threads = await db.collection("threads").aggregate([
    { $match: { members: new ObjectId(myId) } },

    {
      $addFields: { 
        otherUserId: {
          $first: {
            $filter: {
              input: "$members",
              as: "m",
              cond: { $ne: ["$$m", new ObjectId(myId)] }
            }
          }
        }
      }
    },

    {
      $addFields: {
        myUnreadCount: {
          $ifNull: [
            {
              $getField: {
                field: myId,
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

    {
      $project: {
        "unreadCount": 0,
      }
    },

    { $sort: { updatedAt: -1 } }
  ]).toArray();


  res.json({ success: true, threads });
});

router.get('/reqMessages', async (req, res) => {
  const db = getDB("forumsData")
  const thread_id = req.query.threadid
  const userId = req.session.userId

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

  const shaped = threadChats.map((chat) => ({
    _id: chat._id.toString(),
    thread_id: chat.thread_id.toString(),
    text: chat.text,
    sent: chat.sent.toString(),
    createdAt: chat.createdAt,
  }));

  res.json({ success: true, threadChats: shaped });
});

module.exports = router;