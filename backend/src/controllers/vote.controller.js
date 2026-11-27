import asyncHandler from "../utils/asyncHandler.js";
import {
    voteOnPost,
    getUserVoteForPost,
} from "../services/vote.service.js";

// Cast, switch, or remove a vote on a post
export const castVote = asyncHandler(async (req, res) => {
    const result = await voteOnPost(
        req.user._id,
        req.params.postId,
        req.body.value
    );

    res.status(200).json({
        success: true,
        message: "Vote updated successfully.",
        data: result,
    });
});

// Get the current user's vote on a post
export const getMyVote = asyncHandler(async (req, res) => {
    const userVote = await getUserVoteForPost(
        req.user._id,
        req.params.postId
    );

    res.status(200).json({
        success: true,
        data: {
            postId: req.params.postId,
            userVote,
        },
    });
});
