const Post = require("../models/post");

exports.createPost = (req, res) => {
	const { title, description, photo } = req.body;
	Post.create({ title, description, imageUrl: photo, userId: req.user })
		.then((reslut) => {
			console.log("Creat ok!!");
			res.redirect("/");
		})
		.catch((err) => console.log(err));
};

exports.renderCreatePage = (req, res) => {
	res.render("addPost", { title: "Post create" });
};

exports.renderHomePage = (req, res) => {
	Post.find()
		.select("title")
		.populate("userId", "email")
		.then((posts) => {
			res.render("home", {
				title: "Home page",
				postsArr: posts,
			});
		})
		.catch((err) => console.log(err));
};

exports.getPost = (req, res) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then((post) => {
			console.log("Get post Ok!");
			res.render("details", { title: post.title, post });
		})
		.catch((err) => console.log(err));
};

exports.getEditPost = (req, res) => {
	const postId = req.params.postId;

	Post.findById(postId)
		.then((post) => {
			if (!post) {
				return res.redirect("/");
			}
			res.render("editPost", { title: post.title, post });
		})
		.catch((err) => console.log(err));
};

exports.updatePost = (req, res) => {
	const { title, description, photo, postId } = req.body;
	Post.findById(postId)
		.then((post) => {
			post.title = title;
			post.description = description;
			post.imageUrl = photo;
			return post.save();
		})
		.then(() => {
			console.log("Update ok!!");
			res.redirect("/");
		})
		.catch((err) => console.log(err));
};
exports.deletePost = (req, res) => {
	const { postId } = req.params;
	Post.findByIdAndDelete(postId)
		.then(() => {
			console.log("Update ok!!");
			res.redirect("/");
		})
		.catch((err) => console.log(err));
};
