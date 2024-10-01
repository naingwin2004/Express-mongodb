exports.getLogin = (req, res) => {
	res.render("auth/login", { title: "Login page" });
};
exports.postLoginData = (req, res) => {
	res.setHeader("Set-Cookie", "isLogin=true");
	res.redirect("/");
};
