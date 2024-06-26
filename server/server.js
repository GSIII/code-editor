const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const { User } = require("./models/User");
const config = require("./config/config");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());

mongoose
  .connect(config.mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongodb connected"))
  .catch(() => console.log("fail to connect db"));

app.post("/register", (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      return res.json({ success: false, err });
    });
});

io.on("connection", (socket) => {
  console.log("new client connected");

  socket.on("signal", (data) => {
    socket.broadcast.emit("signal", data);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`server is running on port ${PORT}`));
