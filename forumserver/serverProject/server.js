require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const redisClient = require("./redisClient");

const app = express();
const port = process.env.PORT;
const { connectDB } = require("./mongoDb");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new RedisStore({ client: redisClient, prefix: "myapp:" }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // 배포(HTTPS)면 true
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);

(async () => {
  await redisClient.connect();
  await connectDB();

  app.use("/api", require("./routes/forums"));
  app.use("/api", require("./routes/posts"));
  app.use("/api", require("./routes/comments"));
  app.use("/api/auth", require("./routes/accountManage"));
  app.use("/api", require("./routes/mypage"));
  app.use("/api", require("./routes/chatting"));

  app.listen(port, () => console.log(`http://localhost:${port} 에서 서버 실행중`));
})();
