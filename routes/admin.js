const express = require("express");
const path = require("path");
const { body } = require("express-validator");
const router = express.Router();
const postController = require("../controllers/posts");
const userController = require("../controllers/user");

// /admin/create-post
router.get("/create-post", postController.renderCreatePage);

router.post(
	"/",
	[
		body("title")
			.isLength({ min: 1, max: 20 })
			.withMessage("Title must be between 1 and 20 characters."),
		body("description")
			.isLength({ min: 10, max: 200 })
			.withMessage("Description must be between 10 and 200 characters."),
	],
	postController.createPost,
);

router.get("/edit/:postId", postController.getEditPost);

router.post(
	"/edit-post",
	[
		body("title")
			.isLength({ min: 1, max: 20 })
			.withMessage("Title must be between 1 and 20 characters."),
		body("description")
			.isLength({ min: 10, max: 200 })
			.withMessage("Description must be between 10 and 200 characters."),
	],
	postController.updatePost,
);
router.post("/delete/:postId", postController.deletePost);
router.get("/profile", userController.getProfile);

router.get("/username", userController.renderUsernamePage);

router.post(
	"/setusername",
	body("username")
		.isLength({ min: 4, max: 15 })
		.withMessage("username must be between 10 and 20 characters."),
	userController.setUsername,
);

module.exports = router;
