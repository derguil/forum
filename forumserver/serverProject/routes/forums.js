const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../mongoDb');
const requireLogin = require("../middlewares/requireLogin");

router.get('/reqForums', async (req, res) => {
  const db = getDB("forumsData");

  const forums = await db.collection('forums').find().toArray();
  res.send({ success: true, forums: forums });
});

router.get('/reqForum', async (req, res) => {
  const db = getDB("forumsData");
  const forumid = req.query.forumid;

  const forum = await db.collection('forums').findOne({ _id: new ObjectId(forumid) });
  res.send({ success: true, forum: forum });
});

router.post('/addForum', requireLogin, async (req, res) => {
  const db = getDB("forumsData")
  const { forumName } = req.body
  const user_id = req.session.userId

  if (!forumName || forumName.trim() === "") {
    return res.status(400).send({ success: false, message: "게시판 이름을 입력하세요" });
  }

  await db.collection('forums').insertOne({
    title: forumName,
    madeby: new ObjectId(user_id),
  });
  res.send({ success: true });
});

module.exports = router;