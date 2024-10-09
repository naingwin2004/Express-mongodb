const User = require("../models/user");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.SENDER_MAIL,
		pass: process.env.MAIL_PASS,
	},
});

exports.getRegister = (req, res) => {
	res.render("auth/register", {
		title: "Register page",
		message: req.flash("error"),
	});
};

exports.register = (req, res) => {
	const { email, password } = req.body;
	User.findOne({ email })
		.then((user) => {
			if (user) {
				req.flash("error", "Email already exists. Please log in.");
				return res.redirect("/register");
			}
			return bcrypt
				.hash(password, 10)
				.then((hashedPassword) => {
					return User.create({
						email,
						password: hashedPassword,
					});
				})
				.then(() => {
					res.redirect("/login");
					transporter.sendMail(
						{
							from: process.env.SENDER_MAIL,
							to: email,
							subject: "Register",
							html: "<div><h1>Register success</h1><p>Welcome!!!</p></div>",
						},
						(err) => {
							if (err) {
								console.log("Email send error:", err);
							} else {
								console.log("Email sent successfully!");
							}
						},
					);
				});
		})
		.catch((err) => {
			console.log("Registration error:", err);
			req.flash("error", "Something went wrong. Please try again.");
			res.redirect("/register");
		});
};

exports.getLogin = (req, res) => {
	res.render("auth/login", {
		title: "Login page",
		message: req.flash("error"),
	});
};

exports.postLoginData = (req, res) => {
	const { email, password } = req.body;
	User.findOne({ email })
		.then((user) => {
			if (!user) {
				req.flash("error", "Please check your account infomation...");
				return res.redirect("/login");
			}
			bcrypt
				.compare(password, user.password)
				.then((isMatch) => {
					if (isMatch) {
						req.session.isLogin = true;
						req.session.userInfo = user;
						return req.session.save((err) => {
							if (err) {
								console.log(err);
								return res.redirect("/login");
							}
							return res.redirect("/");
						});
					} else {
						req.flash(
							"error",
							"Please check your account infomation...",
						);
						return res.redirect("/login");
					}
				})
				.catch((err) => {
					console.log(err);
					return res.redirect("/login");
				});
		})
		.catch((err) => {
			console.log(err);
			return res.redirect("/login");
		});
};

exports.logout = (req, res) => {
	req.session.destroy(() => {
		res.redirect("/");
	});
};

exports.getRest = (req, res) => {
	res.render("auth/reset", { title: "Reset", message: req.flash("error") });
};

exports.getFeedback = (req, res) => {
	res.render("auth/feedback", {
		title: "Feedback",
	});
};

exports.resetLinkSend = (req, res) => {
	const { email } = req.body;
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect("/reset-password");
		}
		const token = buffer.toString("hex");
		User.findOne({ email })
			.then((user) => {
				if (!user) {
					req.flash("error", "account was not found");
					return res.redirect("/reset-password");
				}
				user.resetToken = token;
				user.tokenExpiration = Date.now() + 18000000;
				return user.save();
			})
			.then((reslut) => {
				res.redirect("/feedback");
				transporter.sendMail(
					{
						from: process.env.SENDER_MAIL,
						to: email,
						subject: "Reset Password",
						html: `<div><h1>Reset Password Now.</h1><a href="http://localhost:8000/reset-password/${token}">Click me</a></div>`,
					},
					(err) => {
						if (err) {
							console.log("Email send error:", err);
						} else {
							console.log("Email sent successfully!");
						}
					},
				);
			})
			.catch((err) => {
				console.log(err);
			});
	});
};

exports.getNewpasswordPage = (req, res) => {
	const { token } = req.params;
	User.findOne({ resetToken: token, tokenExpiration: { $gt: Date.now() } })
		.then((user) => {
			if (user) {
				res.render("auth/new-password", {
					title: "Change password",
					message: req.flash("error"),
					resetToken: token,
					user_id: user._id,
				});
			} else {
				res.redirect("/");
			}
		})
		.catch((err) => console.log(err));
};

exports.changeNewpassword = (req, res) => {
	const { password, confirm_password, user_id, resetToken } = req.body;

	let resetUser;

	User.findOne({
		resetToken,
		tokenExpiration: { $gt: Date.now() },
		_id: user_id,
	})
		.then((user) => {
			if (!user) {
				console.log("usernot found");
				req.flash("error", "User not found or token expired");
				return res.redirect("/reset-password");
			}
			resetUser = user;
			if (password === confirm_password) {
				return bcrypt.hash(password, 10);
			} else {
				req.flash("error", "Passwords do not match");
				return res.redirect(`/reset-password/${resetToken}`);
			}
		})
		.then((hashedPassword) => {
			if (!resetUser) return;
			resetUser.password = hashedPassword;
			resetUser.resetToken = undefined;
			resetUser.tokenExpiration = undefined;
			return resetUser.save();
		})
		.then(() => {
			if (resetUser) {
				res.redirect("/login");
			}
		})
		.catch((err) => {
			console.log(err);
			req.flash("error", "Something went wrong");
		});
};
