const { MongoClient } = require('mongodb');

let client;

async function connectDB() {
  const url = process.env.MONGODB_URL;
  client = await new MongoClient(url).connect();
  console.log('mongoDB연결성공');
  return client;
}

function getDB(dbName) {
  if (!client) throw new Error("DB가 아직 연결되지 않았습니다.");
  return client.db(dbName);
}

module.exports = { connectDB, getDB };