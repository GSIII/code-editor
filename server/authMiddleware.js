// const jwt = require("jsonwebtoken");
// const { User } = require("./models/User");

// const authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     console.log("No authorization header");
//     return res
//       .status(401)
//       .json({ isAuth: false, message: "로그인이 필요합니다." });
//   }

//   const token = authHeader.split(" ")[1]; // Bearer 토큰에서 실제 토큰 추출
//   if (!token) {
//     console.log("Invalid token format");
//     return res
//       .status(401)
//       .json({ isAuth: false, message: "유효하지 않은 토큰" });
//   }

//   try {
//     const decoded = jwt.verify(token, "secretToken");
//     const user = await User.findById(decoded._id);
//     if (!user) {
//       console.log("User not found");
//       return res
//         .status(401)
//         .json({ isAuth: false, message: "사용자를 찾을 수 없음" });
//     }
//     req.user = user;
//     next();
//   } catch (err) {
//     console.log("Token verification failed", err);
//     return res
//       .status(401)
//       .json({ isAuth: false, message: "유효하지 않은 토큰" });
//   }
// };

// module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const { User } = require("./models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("No authorization header");
    return res
      .status(401)
      .json({ isAuth: false, message: "로그인이 필요합니다." });
  }

  const token = authHeader.split(" ")[1]; // Bearer 토큰에서 실제 토큰 추출
  if (!token) {
    console.log("Invalid token format");
    return res
      .status(401)
      .json({ isAuth: false, message: "유효하지 않은 토큰" });
  }

  try {
    const decoded = jwt.verify(token, "secretToken");
    console.log("Decoded JWT:", decoded);

    const userId = decoded._id;
    console.log("User ID from token:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return res
        .status(401)
        .json({ isAuth: false, message: "사용자를 찾을 수 없음" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("Token verification failed", err);
    return res
      .status(401)
      .json({ isAuth: false, message: "유효하지 않은 토큰" });
  }
};

module.exports = authMiddleware;
