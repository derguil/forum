const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://jinjinjin99900_db_user:x6MVCiWPnTB51qfT@cluster0.4ivoptp.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function seed() {
  await client.connect();
  const db = client.db("forumsData");
  const posts = db.collection("posts");

  const parentId = new ObjectId("6953f66a1ef627a2f54d906c");
  const writerId = new ObjectId("6960fd8c8a1999eac909f278");

  const docs = [];

  for (let i = 1; i <= 100; i++) {
    docs.push({
      parent_id: parentId,
      title: `${i}`,
      content: `${i}`,
      images: [],
      wtime: new Date(Date.now() - i * 1000 * 30),
      wby: writerId,
      commentCount: Math.floor(Math.random() * 10)
    });
  }

  await posts.insertMany(docs);
  console.log("✅ posts 더미 100개 생성 완료");

  await client.close();
}

seed();

