exports.get404Page = (req, res, next) => {
	res.status(404).render("error/404", { title: "Page was not found" });
};
exports.get500Page = (err,req, res, next) => {
	res.status(404).render("error/500", { title: "Somthing went wrong" });
};
