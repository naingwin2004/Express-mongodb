const express = require("express");
const path = require("path");

const postController = require("../controllers/posts");

const router = express.Router();

router.get("/", postController.renderHomePage);

router.get("/post/:postId", postController.getPost);

router.post("/edit-post",postController.updatePost);

module.exports = router;
