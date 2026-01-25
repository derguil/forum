const express = require("express");
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../mongoDb');
const requireLogin = require("../middlewares/requireLogin");

router.post("/sendMessage", requireLogin, async (req, res) => {
  const io = req.app.get("io");

  const db = getDB("forumsData");
  const myId = req.session.userId;
  
  const { threadid, text } = req.body;
  if (!threadid || !text) {
    return res.status(400).json({ success: false, message: "threadid/text 필요" });
  }

  const thread = await db.collection("threads").findOne({
    _id: new ObjectId(threadid),
    members: new ObjectId(myId),
  });
  if (!thread) {
    return res.status(403).json({ success: false, message: "thread 접근 권한 없음" });
  }

  const otherObjId = thread.members.find((id) => id.toString() !== myId);
  if (!otherObjId) {
    return res.status(500).json({ success: false, message: "상대 유저 식별 실패" });
  }
  const otherUserId = otherObjId.toString();

  const createdAt = new Date();
  const newMessage = {
    thread_id: new ObjectId(threadid),
    text,
    sent: new ObjectId(myId),
    createdAt,
  }

  const result = await db.collection("messages").insertOne(newMessage)

  await db.collection("threads").updateOne(
    { _id: new ObjectId(threadid) },
    {
      $set: {
        lastMessage: text,
        updatedAt: createdAt,
      },
      $inc: {
        [`unreadCount.${otherUserId}`]: 1,
      },
    }
  );

  io.to(`thread:${threadid}`).emit("broadcast", {
    _id: result.insertedId.toString(),
    thread_id: threadid,
    text: text,
    sent: myId,
    createdAt: createdAt,
  });

  io.to(`user:${myId}`).emit("thread:update", {
    thread_id: threadid,
    lastMessage: text,
    updatedAt: createdAt,
    unreadCountInc: 0,
  });

  io.to(`user:${otherUserId}`).emit("thread:update", {
    thread_id: threadid,
    lastMessage: text,
    updatedAt: createdAt,
    unreadCountInc: 1,
  });

  return res.json({ success: true });
});

module.exports = router;