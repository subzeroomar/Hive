import Vote from "../models/Vote.js";
import Post from "../models/Post.js";

// Cast, switch, or remove a vote on a post
export const voteOnPost = async (userId, postId, rawValue) => {
    const value = Number(rawValue);

    if (value !== 1 && value !== -1) {
        const error = new Error("Vote value must be 1 (upvote) or -1 (downvote).");
        error.statusCode = 400;
        throw error;
    }

    const post = await Post.findById(postId);

    if (!post) {
        const error = new Error("Post not found.");
        error.statusCode = 404;
        throw error;
    }

    const existingVote = await Vote.findOne({
        user: userId,
        post: postId,
    });

    let upvoteDelta = 0;
    let downvoteDelta = 0;
    let userVote = 0;

    if (!existingVote) {
        // New vote
        await Vote.create({
            user: userId,
            post: postId,
            value,
        });

        if (value === 1) upvoteDelta = 1;
        else downvoteDelta = 1;
        userVote = value;
    } else if (existingVote.value === value) {
        // Clicking the same vote removes it
        await Vote.deleteOne({ _id: existingVote._id });

        if (value === 1) upvoteDelta = -1;
        else downvoteDelta = -1;
        userVote = 0;
    } else {
        // Switching vote direction
        existingVote.value = value;
        await existingVote.save();

        if (value === 1) {
            upvoteDelta = 1;
            downvoteDelta = -1;
        } else {
            upvoteDelta = -1;
            downvoteDelta = 1;
        }
        userVote = value;
    }

    const scoreDelta = upvoteDelta - downvoteDelta;

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
            $inc: {
                upvotes: upvoteDelta,
                downvotes: downvoteDelta,
                score: scoreDelta,
            },
        },
        { new: true }
    );

    return {
        postId: updatedPost._id,
        upvotes: updatedPost.upvotes,
        downvotes: updatedPost.downvotes,
        score: updatedPost.score,
        userVote,
    };
};

// Get the authenticated user's vote for a single post
export const getUserVoteForPost = async (userId, postId) => {
    const vote = await Vote.findOne({
        user: userId,
        post: postId,
    }).select("value");

    return vote ? vote.value : 0;
};
