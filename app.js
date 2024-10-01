const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const User = require("./models/user");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
	User.findById("66fa6f69855ca27587164459").then((user) => {
		req.user = user;
		next();
	});
});

app.use("/admin", adminRoutes);
app.use(postRoutes);
app.use(authRoutes);

mongoose
	.connect(process.env.MONGODB_URL)
	.then(() => {
		app.listen(8000);
		console.log(" Your server is running on port 8000");
		return User.findOne().then((user) => {
			if (!user) {
				User.create({
					username: "Naing Win",
					email: "naingwin.dev@gamil.com",
					password: "abcdefg",
				});
			}
			return user;
		});
	})
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
