const express = require("express");
const User = require("../models/user");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { id } = require("date-fns/locale");

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

  User.findOne({ email: email })
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

module.exports = router;
