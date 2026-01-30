const { getDB } = require("../mongoDb");

async function rebuildTrendRankings({ minutes, topN }) {
  const db = getDB("forumsData");
  const since = new Date(Date.now() - minutes * 60 * 1000);   //60 분

  const rows = await db.collection("postVotes").aggregate([
    { $match: { votedAt: { $gte: since } } },                 //최근 since시간 동안 투표가 많이 몰린 글
    { $group: { _id: "$postId", score: { $sum: 1 } } },
    // { $match: { score: { $gte: 10 } } },                   //최소 공감 10개 이상
    { $sort: { score: -1 } },
    { $limit: topN },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "_id",
        as: "post"
      }
    },
    { $unwind: "$post" },
  ]).toArray();

  if (rows.length === 0) return { ok: true, updated: 0 };

  await db.collection("trends").deleteMany({});
  const docs = rows.map(r => ({
    postId: r._id,
    score: r.score,
    post: r.post,
    createdAt: new Date()
  }));
  await db.collection("trends").insertMany(docs);


  // // 오래된 항목 정리(선택): 2*window 이상 갱신 안 된 것 삭제
  // const staleBefore = new Date(Date.now() - minutes * 2 * 60 * 1000);
  // await db.collection("rankings").deleteMany({
  //   forumType: "hot",
  //   window,
  //   rankedAt: { $lt: staleBefore }
  // });

  return { ok: true, updated: rows.length };
}

module.exports = { rebuildTrendRankings };
