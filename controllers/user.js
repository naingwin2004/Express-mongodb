const Post = require("../models/post");
const User = require("../models/user");
const { validationResult } = require("express-validator");

const post_par_page = 3;
exports.getProfile = (req, res) => {
	const pageNumber = +req.query.page || 1;
	Post.find({ userId: req.user._id })
		.countDocuments()
		.then((totalPost) => {
			return Post.find({ userId: req.user._id })
				.populate("userId", "email username")
				.skip((pageNumber - 1) * post_par_page)
				.limit(post_par_page)
				.sort({ createdAt: -1 })
				.then((posts) => {
					if (posts.length > 0) {
						return res.render("user/profile", {
							title: "email",
							postsArr: posts,
							currentUserEmail: req.session.userInfo
								? req.session.userInfo.email
								: null,
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

exports.getPublicProfile = (req, res, next) => {
	const { id } = req.params;
	const pageNumber = +req.query.page || 1;
	Post.find({ userId: id })
		.countDocuments()
		.then((totalPost) => {
			return Post.find({ userId: id })
				.populate("userId", "email username")
				.skip((pageNumber - 1) * post_par_page)
				.limit(post_par_page)
				.sort({ createdAt: -1 })
				.then((posts) => {
					if (posts.length > 0) {
						return res.render("user/public-profile", {
							title: "email",
							postsArr: posts,
							currentUserEmail: posts[0].userId.email,
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

exports.renderUsernamePage = (req, res) => {
	res.render("user/username", { title: "Set UserName", message: "" });
};

exports.setUsername = (req, res, next) => {
	let { username } = req.body;
	const updateuserName = username.replace(/@+/g, "");
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("user/username", {
			title: "Set UserName",
			message: errors.array()[0].msg,
		});
	}

	// Username duplication checking
	User.findOne({ username: `@${updateuserName}` })
		.then((existingUser) => {
			if (existingUser) {
				return res.status(422).render("user/username", {
					title: "Set UserName",
					message: "Username already exists. Please choose another.",
				});
			}

			return User.findById(req.user._id).then((user) => {
				user.username = `@${updateuserName}`;
				return user.save().then(() => {
					return res.redirect("/admin/profile");
				});
			});
		})
		.catch((err) => {
			console.log(err);
			const error = new Error("UserName Error");
			return next(error);
		});
};
