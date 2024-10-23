const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const postsSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
},{timestamps: true,});

module.exports = model("Post", postsSchema);
