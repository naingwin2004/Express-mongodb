const mongodb = require("mongodb");
const { getDatabase } = require("../utils/database");

class Post {
	constructor(title, description, imageUrl, id) {
		this.title = title;
		this.description = description;
		this.imageUrl = imageUrl;
		this._id = id ? new mongodb.ObjectId(id) : null;
	}

	create() {
		const db = getDatabase();
		let dbOperation;

		if (this._id) {
			// Update existing post
			dbOperation = db.collection("posts").updateOne(
				{ _id: this._id },
				{
					$set: {
						title: this.title,
						description: this.description,
						imageUrl: this.imageUrl,
					},
				},
			);
		} else {
			// Insert new post
			dbOperation = db.collection("posts").insertOne(this);
		}

		return dbOperation
			.then((result) => {
				console.log("Operation successful");
			})
			.catch((err) => console.log(err));
	}

	static getPosts() {
		const db = getDatabase();
		return db
			.collection("posts")
			.find()
			.toArray()
			.then((posts) => {
				return posts;
			})
			.catch((err) => console.log(err));
	}

	static getPost(postId) {
		const db = getDatabase();
		return db
			.collection("posts")
			.findOne({ _id: new mongodb.ObjectId(postId) })
			.then((post) => {
				return post;
			})
			.catch((err) => console.log(err));
	}

	static deleteById(postId) {
		const db = getDatabase();
		return db
			.collection("posts")
			.deleteOne({ _id: new mongodb.ObjectId(postId) })
			.then(() => {
				console.log("Deleted ok!!");
			})
			.catch((err) => console.log(err));
	}
}

module.exports = Post;
