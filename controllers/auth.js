const User = require("../models/user");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { validationResult } = require("express-validator");
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
		oldFromData: { email: "", password: "" },
	});
};

exports.register = (req, res) => {
	const { email, password } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("auth/register", {
			title: "Register page",
			message: errors.array()[0].msg,
			oldFromData: { email, password },
		});
	}

	bcrypt
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
					html: `<div style="background-color: #fff4e6; color: #4b3832; font-family: Arial, sans-serif; text-align: center; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); max-width: 300px; margin: 50px auto;">
    <h2 style="color: #854442;">Register Complete</h2>
    <p style="color: #3c2f2f; font-size: 16px; margin-top:20px;">Welcome! Your registration is complete. Thank you for joining us!</p>
</div>`,
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
};

exports.getLogin = (req, res) => {
	res.render("auth/login", {
		title: "Login page",
		message: req.flash("error"),
		oldFromData: { email: "", password: "" },
	});
};

exports.postLoginData = (req, res) => {
	const { email, password } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("auth/login", {
			title: "Login page",
			message: errors.array()[0].msg,
			oldFromData: { email, password },
		});
	}
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
	res.render("auth/reset", {
		title: "Reset",
		message: req.flash("error"),
	});
};

exports.getFeedback = (req, res) => {
	res.render("auth/feedback", {
		title: "Feedback",
	});
};

exports.resetLinkSend = (req, res) => {
	const { email } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("auth/reset", {
			title: "Reset",
			message: errors.array()[0].msg,
		});
	}
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect("/reset-password");
		}
		const token = buffer.toString("hex");
		User.findOne({ email })
			.then((user) => {
				if (!user) {
					return res.status(422).render("auth/reset", {
						title: "Reset",
						message: "No account Found",
					});
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
						html: `<div style="background-color: #fff4e6; border: 2px solid #854442; border-radius: 10px; padding: 20px; text-align: center; color: #4b3832; max-width: 500px; margin: auto; font-family: Arial, sans-serif;">
    <h1 style="color: #4b3832;">Reset Your Password Now</h1>
    <p style="margin: 10px 0;">We received a request to reset your password. Click the button below to reset it:</p>
    <a href="http://localhost:8000/reset-password/${token}" style="display: inline-block; background-color: #854442; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Reset Password</a>
</div>`,
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
					message: "",
					resetToken: token,
					user_id: user._id,
					oldFormData: { password: "" },
				});
			} else {
				res.redirect("/");
			}
		})
		.catch((err) => console.log(err));
};

exports.changeNewpassword = (req, res) => {
	const { password, user_id, resetToken } = req.body;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("auth/new-password", {
			title: "Change password",
			resetToken,
			user_id,
			message: errors.array()[0].msg,
			oldFormData: { password },
		});
	}

	let resetUser;
	User.findOne({
		resetToken,
		tokenExpiration: { $gt: Date.now() },
		_id: user_id,
	})
		.then((user) => {
			resetUser = user;
			return bcrypt.hash(password, 10);
		})
		.then((hashedPassword) => {
			resetUser.password = hashedPassword;
			resetUser.resetToken = undefined;
			resetUser.tokenExpiration = undefined;
			return resetUser.save();
		})
		.then(() => {
			res.redirect("login");
		})
		.catch((err) => console.log(err));
};
