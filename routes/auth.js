const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
router.get("/register", authController.getRegister);
router.get("/login", authController.getLogin);
router.post("/register", authController.register);
router.post("/login", authController.postLoginData);
router.post("/logout", authController.logout);

router.get("/reset-password", authController.getRest);
router.get("/feedback", authController.getFeedback);
router.post("/reset", authController.resetLinkSend);
router.get("/reset-password/:token", authController.getNewpasswordPage);
router.post("/change-new-password", authController.changeNewpassword);

module.exports = router;
