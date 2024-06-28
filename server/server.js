const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const { User } = require("./models/User");
const config = require("./config/config");
const cookieParser = require("cookie-parser");
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
app.use(cookieParser());

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

app.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.json({ loginSuccess: false, message: "사용자가 없습니다." });
      }
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch)
          return res.json({
            loginSuccess: false,
            message: "비밀번호가 틀렸습니다.",
          });
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          res
            .cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id, token: user.token });
        });
      });
    })
    .catch((err) => {
      return res.status(400).send(err);
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
