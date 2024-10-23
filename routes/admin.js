const express = require("express");
const path = require("path");
const { body } = require("express-validator");
const router = express.Router();
const postController = require("../controllers/posts");

// /admin/create-post
router.get("/create-post", postController.renderCreatePage);

router.post(
	"/",
	[
		body("title")
			.isLength({ min: 10, max: 60 })
			.withMessage("Title must be between 10 and 60 characters."),
		body("photo").isURL().withMessage("image must be valid url")
		,
		body("description")
			.isLength({ min: 10, max: 200 })
			.withMessage("Description must be between 10 and 200 characters.")
		,
	],
	postController.createPost,
);

router.get("/edit/:postId", postController.getEditPost);

router.post("/edit-post",	[
		body("title")
			.isLength({ min: 10, max: 60 })
			.withMessage("Title must be between 10 and 60 characters."),
		body("photo").isURL().withMessage("image must be valid url")
		,
		body("description")
			.isLength({ min: 10, max: 200 })
			.withMessage("Description must be between 10 and 200 characters.")
		,
	], postController.updatePost);
router.post("/delete/:postId", postController.deletePost);

module.exports = router;
