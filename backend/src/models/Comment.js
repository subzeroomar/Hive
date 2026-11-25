
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "Comment content is required"],
            trim: true,
            maxlength: 5000,
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },

        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Retrieves top-level comments and replies for a post.
commentSchema.index({
    post: 1,
    parentComment: 1,
    createdAt: 1,
});

// Helps retrieve all comments written by a user.
commentSchema.index({
    author: 1,
    createdAt: -1,
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
