
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Post title is required"],
            trim: true,
            maxlength: 200,
        },

        content: {
            type: String,
            default: "",
            maxlength: 10000,
        },

        image: {
            type: String,
            default: "",
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },

        upvotes: {
            type: Number,
            default: 0,
            min: 0,
        },

        downvotes: {
            type: Number,
            default: 0,
            min: 0,
        },

        score: {
            type: Number,
            default: 0,
        },

        commentCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Supports retrieving a community's newest posts.
postSchema.index({ community: 1, createdAt: -1 });

// Supports sorting posts by popularity.
postSchema.index({ score: -1, createdAt: -1 });

// Supports retrieving an author's posts.
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
