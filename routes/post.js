const express = require("express");
const path = require("path");

const postController = require("../controllers/posts");
const userController = require("../controllers/user");

const router = express.Router();

router.get("/", postController.renderHomePage);

router.get("/post/:postId", postController.getPost);

router.post("/edit-post", postController.updatePost);

router.get("/profile/:id", userController.getPublicProfile);

module.exports = router;
