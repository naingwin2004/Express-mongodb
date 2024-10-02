const User = require("../models/user");
const bcrypt = require("bcryptjs");
exports.getRegister = (req, res) => {
	res.render("auth/register", { title: "Register page" });
};
exports.register = (req, res) => {
	const { email, password } = req.body;
	User.findOne({ email })
		.then((user) => {
			if (user) {
				return res.redirect("/login");
			}
			return bcrypt
				.hash(password, 10)
				.then((hashedPassword) => {
					return User.create({
						email,
						password: hashedPassword,
					});
				})
				.then(() => res.redirect("/login"));
		})
		.catch((err) => console.log(err));
};
exports.getLogin = (req, res) => {
	res.render("auth/login", { title: "Login page" });
};
exports.postLoginData = (req, res) => {
	const { email, password } = req.body;
	User.findOne({ email })
		.then((user) => {
			if (!user) {
				// User မရှိတာဆိုရင် /login ပြန်သွားပါ
				return res.redirect("/login");
			}
			bcrypt
				.compare(password, user.password)
				.then((isMatch) => {
					if (isMatch) {
						// User နှင့် password ကို တူကြောင်း စစ်ပြီးရင် session save
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
						// Password မတူရင် /login ပြန်သွားပါ
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
