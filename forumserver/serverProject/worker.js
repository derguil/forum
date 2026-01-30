const cron = require("node-cron");
const { rebuildTrendRankings } = require("./jobs/rebuildTrendRankings");

function startCron(){
  console.log('cron 연결성공')
  cron.schedule("0 * * * *", async () => {  //thrends ranking 1시간마다 갱신
    try {
      const r = await rebuildTrendRankings({ minutes: 60, topN: 2 });
      console.log("Trend rankings rebuilt", r);
    } catch (e) {
      console.error("Trend rankings rebuild failed", e);
    }
  });
}

module.exports = { startCron }