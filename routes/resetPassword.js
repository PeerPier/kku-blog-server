const express = require("express");
const User = require("../models/user");
const Admin = require("../models/admin"); // เพิ่มการใช้ Admin model
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

const formDatatoSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return {
    access_token,
    _id: user._id,
    profile_picture: user.profile_picture,
    username: user.username,
    fullname: user.fullname,
  };
};

router.post("/", (req, res) => {
  let { email, password } = req.body;

  console.log("Email:", email);
  console.log("Password:", password);

  Admin.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "ไม่พบผู้ใช้" });
      }
      if (!user.google_auth) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res
              .status(403)
              .json({ error: "เกิดข้อผิดพลาดขณะเข้าสู่ระบบ โปรดลองอีกครั้ง" });
          }

          if (!result) {
            return res.status(403).json({ error: "รหัสผ่านไม่ถูกต้อง" });
          } else {
            console.log("formDatatoSend(user)", formDatatoSend(user));
            return res.status(200).json(formDatatoSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error:
            "บัญชีถูกสร้างด้วยบัญชี Google แล้ว โปรดเข้าสู่ระบบด้วย Google",
        });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

router.post("/:type/:id/:token", async (req, res) => {
  const { id, token, type } = req.params;
  const { password } = req.body;
  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.json({ Status: "Error with token" });
    } else {
      bcrypt
        .hash(password, 10)
        .then((hash) => {
          // ตรวจสอบว่าประเภทเป็น user หรือ admin แล้วอัปเดตรหัสผ่าน
          const model = type === "admin" ? Admin : User; // เลือก model ที่เหมาะสม
          model
            .findByIdAndUpdate({ _id: id }, { password: hash })
            .then((u) => res.send({ Status: "Success" }))
            .catch((err) => res.send({ Status: err.message }));
        })
        .catch((err) => res.send({ Status: err.message }));
    }
  });
});

module.exports = router;

// เพิ่มโค้ดทดสอบ JWT ที่นี่
const testToken = jwt.sign(
  { userId: "66a0d89f4ee74c78f492432e" }, // ใช้ userId จริง
  "Jungkook1997", // ใช้ค่า JWT_SECRET จริง
  { expiresIn: "1d" }
);

console.log("Test Token:", testToken);
