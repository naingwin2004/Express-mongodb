const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const User = require("./models/user");
const store = new mongoStore({
	uri: process.env.MONGODB_URI,
	collection: "sessions",
});
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	session({
		secret: process.env.SESSION_KEY,
		resave: false,
		saveUninitialized: false,
		store,
	}),
);

app.use("/admin", adminRoutes);
app.use(postRoutes);
app.use(authRoutes);

mongoose
	.connect(process.env.MONGODB_URL)
	.then(() => {
		app.listen(8000);
		console.log(" Your server is running on port 8000");
	})
	.catch((err) => console.log(err));
