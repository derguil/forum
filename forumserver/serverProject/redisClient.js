const redis = require('redis')

const redisClient = redis.createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
})

redisClient.on('connect', () => console.log("redis연결성공"))
redisClient.on("error", (err) =>
  console.log("Redis Client Error:", err)
);

module.exports = redisClient