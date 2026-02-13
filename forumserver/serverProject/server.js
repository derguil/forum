require("dotenv").config();
const express = require("express");

const { connectDB } = require("./mongoDb");

const session = require("express-session");
const { RedisStore } = require("connect-redis");
const redisClient = require("./redisClient");

const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const { startCron } = require("./worker.js")

const app = express();
const server = http.createServer(app);
const port = process.env.PORT;


const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  app.use(cors({
    origin: `http://localhost:${port}`,
    credentials: true,
  }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,     // 배포(HTTPS면) true
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 2,
  },
});
app.use(sessionMiddleware)

const io = new Server(server, {
  cors: !isProd ? {
    origin: `http://localhost:${port}`,
    methods: ["GET", "POST"],
    credentials: true,
  } : undefined,
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
io.use((socket, next) => {
  const userId = socket.request.session?.userId;
  if (!userId) return next(new Error("UNAUTHORIZED"));
  // -DB에서 user 조회해서 붙이기
  // socket.user = await users.findOne({ _id: new ObjectId(userId) });
  
  socket.userId = userId;
  next(); 
});

io.on("connection", (socket) => {
  socket.on("user:join", (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on("thread:join", (threadId) => {
    socket.join(`thread:${threadId}`);
  });

  socket.on("thread:leave", (threadId) => {
    socket.leave(`thread:${threadId}`);
  });

  socket.on("disconnect", () => {});
});

app.set("io", io);

app.use("/api", require("./routes/forums"));
app.use("/api", require("./routes/posts"));
app.use("/api", require("./routes/rankedposts"));
app.use("/api", require("./routes/comments"));
app.use("/api/auth", require("./routes/accountManage"));
app.use("/api", require("./routes/mypage"));
app.use("/api", require("./routes/chatting"));
app.use("/api", require("./routes/socketIOchattings"));

(async () => {
  try {
    await redisClient.connect();
    await connectDB();
    startCron()
    
    if(!isProd){
      server.listen(port, () => {
        console.log(`http://localhost:${port} 에서 서버 실행중`)
      });
    } else {
      server.listen(port, "127.0.0.1", () => {
        console.log(`배포 환경에서 포트 ${port}로 서버 실행중`)
      });
    }
  } catch (error) {
    console.error("서버 시작 실패:", error);
    process.exit(1);
  }
})();