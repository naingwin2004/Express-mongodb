const Post = require("../models/post");
const { validationResult } = require("express-validator");
const { formatISO9075 } = require("date-fns");

const fileDelete = require("../utils/fileDelete.js");

exports.createPost = (req, res, next) => {
	const { title, description } = req.body;
	const image = req.file;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render("addPost", {
			title: "Post create",
			message: errors.array()[0].msg,
			oldFromData: { title, description },
		});
	}
	if (image === undefined) {
		return res.status(422).render("addPost", {
			title: "Post create",
			message: "image must be jpg,jpeg and png.",
			oldFromData: { title, description },
		});
	}
	Post.create({ title, description, imageUrl: image.path, userId: req.user })
		.then((reslut) => {
			console.log("Creat ok!!");
			return res.redirect("/");
		})
		.catch((err) => {
			console.log(err);
			const error = new Error("Lee");
			return next(error);
		});
};

exports.renderCreatePage = (req, res) => {
	res.render("addPost", {
		title: "Post create",
		oldFromData: { title: "", description: "", photo: "" },
		message: "",
	});
};

const post_par_page = 3;
exports.renderHomePage = (req, res, next) => {
	const pageNumber = +req.query.page || 1;
	Post.find()
		.countDocuments()
		.then((totalPost) => {
			return Post.find()
				.select("title description imageUrl")
				.populate("userId", "email username")
				.skip((pageNumber - 1) * post_par_page)
				.limit(post_par_page)
				.sort({ createdAt: -1 })
				.then((posts) => {
					if (posts.length > 0) {
						return res.render("home", {
							title: "Home page",
							postsArr: posts,
							currentUserId: req.session.userInfo
								? req.session.userInfo._id
								: "",
							hasNextPage: post_par_page * pageNumber < totalPost,
							hasPreviousPage: pageNumber > 1,
							nextPage: pageNumber + 1,
							previousPage: pageNumber - 1,
						});
					} else {
						return res.render("nopost", { title: "No post" });
					}
				});
		})
		.catch((err) => {
			console.log(err);
			const error = new Error("Somthing went wrong.");
			return next(error);
		});
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.populate("userId", "email username")
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
			const error = new Error("Somthing went wrong.");
			return next(error);
		});
};

exports.getEditPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				return res.redirect("/");
			}
			return res.render("editPost", {
				title: post.title,
				post,
				postId,
				message: "",
				oldFromData: {
					title: post.title,
					description: post.description,
				},
				isValidationFail: false,
			});
		})
		.catch((err) => {
			console.log(err);
			const error = new Error("Somthing went wrong.");
			return next(error);
		});
};

exports.updatePost = (req, res, next) => {
	const { title, description, postId } = req.body;
	const image = req.file;
	const errors = validationResult(req);

	if (!image) {
		return res.status(422).render("editPost", {
			title,
			postId,
			message: "image must be jpg, jpeg, or png.",
			oldFromData: { title, description },
			isValidationFail: true,
		});
	}
	if (!errors.isEmpty()) {
		return res.status(422).render("editPost", {
			title,
			postId,
			message: errors.array()[0].msg,
			oldFromData: { title, description },
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
			if (image) {
				fileDelete(post.imageUrl);
				post.imageUrl = image.path;
			}
			return post.save();
		})
		.then(() => {
			console.log("Update ok!!");
			res.redirect("/");
		})
		.catch((err) => {
			console.log(err);
			const error = new Error("Something went wrong.");
			next(error);
		});
};

exports.deletePost = (req, res, next) => {
	const { postId } = req.params;
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				return res.redirect("/");
			}
			if(post){
			fileDelete(post.imageUrl);
			return Post.deleteOne({ _id: postId, userId: req.user._id });
			  
			}
		})
		.then(() => {
			console.log("delete ok!!");
			res.redirect("/");
		})
		.catch((err) => {
			console.log(err);
			const error = new Error("Somthing went wrong.");
			return next(error);
		});
};
