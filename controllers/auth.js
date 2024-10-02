exports.getRegister = (req, res) => {
	res.render("auth/register", { title: "Register page" });
};
const User = require("../models/user");
exports.register = (req, res) => {
	const { email, password } = req.body;
	User.findOne({ email })
		.then((user) => {
			if (user) {
				return res.redirect("/login");
			}
			return User.create({
				email,
				password,
			}).then(() => res.redirect("/"));
		})
		.catch((err) => console.log(err));
};
exports.getLogin = (req, res) => {
	res.render("auth/login", { title: "Login page" });
};
exports.postLoginData = (req, res) => {
	//res.setHeader("Set-Cookie", "isLogin=true");
	req.session.isLogin = true;
	res.redirect("/");
};

exports.logout = (req, res) => {
	req.session.destroy(() => {
		res.redirect("/");
	});
};
