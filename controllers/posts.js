const Post = require("../models/post");
const { validationResult } = require("express-validator");
const { formatISO9075 } = require("date-fns");
exports.createPost = (req, res) => {
	const { title, description, photo } = req.body;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render("addPost", {
			title: "Post create",
			message: errors.array()[0].msg,
			oldFromData: { title, description, photo },
		});
	}
	Post.create({ title, description, imageUrl: photo, userId: req.user })
		.then((reslut) => {
			console.log("Creat ok!!");
			res.redirect("/");
		})
		.catch((err) => console.log(err));
};

exports.renderCreatePage = (req, res) => {
	res.render("addPost", {
		title: "Post create",
		oldFromData: { title: "", description: "", photo: "" },
		message: "",
	});
};

exports.renderHomePage = (req, res) => {
	console.log(req.session.userInfo);
	Post.find()
		.select("title description")
		.populate("userId", "email")
		.then((posts) => {
			res.render("home", {
				title: "Home page",
				postsArr: posts,
				currentUserEmail: req.session.userInfo
					? req.session.userInfo.email
					: null,
			});
		})
		.catch((err) => console.log(err));
};

exports.getPost = (req, res,next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.populate("userId", "email")
		.then((post) => {
			console.log("Get post Ok!");
			res.render("details", {
				title: post.title,
				post,
				date: post.createdAt
					? formatISO9075(post.createdAt, { representation: "date" })
					: "",
				currentLoginUserId: req.session.userInfo
					? req.session.userInfo._id
					: "",
			});
		})
		.catch((err) => {
			console.log(err);
			const error = new Error("Somthing went wrong.")
			return next(error)
		});
};

exports.getEditPost = (req, res) => {
	const postId = req.params.postId;

	Post.findById(postId)
		.then((post) => {
			if (!post) {
				return res.redirect("/");
			}
			res.render("editPost", {
				title: post.title,
				post,
				postId: undefined,
				message: "",
				oldFromData: {
					title: undefined,
					description: undefined,
					photo: undefined,
				},
				isValidationFail: false,
			});
		})
		.catch((err) => console.log(err));
};

exports.updatePost = (req, res) => {
	const { title, description, photo, postId } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("editPost", {
			title,
			postId,
			message: errors.array()[0].msg,
			oldFromData: { title, description, photo },
			isValidationFail: true,
		});
	}
	Post.findById(postId)
		.then((post) => {
			if (post.userId.toString() !== req.user._id.toString()) {
				return res.redirect("/");
			}
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
	Post.deleteOne({ _id: postId, userId: req.user._id })
		.then(() => {
			console.log("Update ok!!");
			res.redirect("/");
		})
		.catch((err) => console.log(err));
};
