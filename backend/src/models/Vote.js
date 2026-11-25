
import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },

        value: {
            type: Number,
            required: true,
            enum: [1, -1],
        },
    },
    {
        timestamps: true,
    }
);

// Each user can have only one active vote per post.
voteSchema.index(
    { user: 1, post: 1 },
    { unique: true }
);

// Helps retrieve all votes belonging to a post.
voteSchema.index({ post: 1 });

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
