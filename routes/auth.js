const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const User = require("../models/user.js");
const authController = require("../controllers/auth");
router.get("/register", authController.getRegister);
router.get("/login", authController.getLogin);
router.post(
	"/register",
	body("email")
		.isEmail()
		.withMessage("Please enter a valid email...")
		.custom((value, { req }) => {
			return User.findOne({ email: value }).then((user) => {
				if (user) {
					return Promise.reject("Email already exists.");
				}
			});
		}),
	body("password")
		.isLength({ min: 4 })
		.trim()
		.withMessage("Password must be 4 character"),
	authController.register,
);
router.post(
	"/login",
	body("email").isEmail().withMessage("Please enter a valid email..."),
	body("password")
		.isLength({ min: 4 })
		.trim()
		.withMessage("Password must be 4 character"),
	authController.postLoginData,
);
router.post("/logout", authController.logout);

router.get(
	"/reset-password",
	authController.getRest,
);
router.get("/feedback", authController.getFeedback);
router.post("/reset",body("email").isEmail().withMessage("Please enter a valid email..."), authController.resetLinkSend);
router.get("/reset-password/:token", authController.getNewpasswordPage);
router.post("/change-new-password", authController.changeNewpassword);

module.exports = router;
