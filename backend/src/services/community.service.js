import Community from "../models/Community.js";
import Membership from "../models/Membership.js";

// Return public community information
const getSafeCommunity = async (community) => {
    const memberCount = await Membership.countDocuments({
        community: community._id,
    });

    return {
        id: community._id,
        name: community.name,
        description: community.description,
        creator: community.creator,
        memberCount,
        createdAt: community.createdAt,
    };
};

// CREATE COMMUNITY
export const createCommunity = async (userId, data) => {
    const { name, description } = data;

    if (!name || !name.trim()) {
        const error = new Error("Community name is required.");
        error.statusCode = 400;
        throw error;
    }

    const normalizedName = name.trim().toLowerCase();

    if (normalizedName.length < 3 || normalizedName.length > 30) {
        const error = new Error(
            "Community name must be between 3 and 30 characters."
        );
        error.statusCode = 400;
        throw error;
    }

    if (description && description.length > 500) {
        const error = new Error(
            "Community description cannot exceed 500 characters."
        );
        error.statusCode = 400;
        throw error;
    }

    const existingCommunity = await Community.findOne({
        name: normalizedName,
    });

    if (existingCommunity) {
        const error = new Error("This community name is already taken.");
        error.statusCode = 409;
        throw error;
    }

    let community;

    try {
        community = await Community.create({
            name: normalizedName,
            description: description || "",
            creator: userId,
        });
    } catch (err) {
        // Handle duplicate names caused by simultaneous requests.
        if (err.code === 11000) {
            const error = new Error("This community name is already taken.");
            error.statusCode = 409;
            throw error;
        }

        throw err;
    }

// The creator automatically becomes the first member.
try {
    await Membership.create({
        user: userId,
        community: community._id,
    });
} catch (err) {
    // Roll back community creation if membership creation fails.
    await Community.findByIdAndDelete(community._id);

    throw err;
}

return getSafeCommunity(community);
};

// GET COMMUNITY BY NAME
export const getCommunityByName = async (name) => {
    const community = await Community.findOne({
        name: name.toLowerCase(),
    });

    if (!community) {
        const error = new Error("Community not found.");
        error.statusCode = 404;
        throw error;
    }

    return getSafeCommunity(community);
};

// SEARCH COMMUNITIES
export const searchCommunities = async (query) => {
    if (!query || !query.trim()) {
        const error = new Error("Search query is required.");
        error.statusCode = 400;
        throw error;
    }

    const communities = await Community.find({
        name: {
            $regex: query.trim(),
            $options: "i",
        },
    })
        .limit(20)
        .sort({ name: 1 });

    return Promise.all(
        communities.map(getSafeCommunity)
    );
};

// JOIN COMMUNITY
export const joinCommunity = async (userId, communityId) => {
    const community = await Community.findById(communityId);

    if (!community) {
        const error = new Error("Community not found.");
        error.statusCode = 404;
        throw error;
    }

    try {
        await Membership.create({
            user: userId,
            community: communityId,
        });
    } catch (err) {
        if (err.code === 11000) {
            const error = new Error("You are already a member.");
            error.statusCode = 409;
            throw error;
        }

        throw err;
    }

    return getSafeCommunity(community);
};

// LEAVE COMMUNITY
export const leaveCommunity = async (userId, communityId) => {
    const community = await Community.findById(communityId);

    if (!community) {
        const error = new Error("Community not found.");
        error.statusCode = 404;
        throw error;
    }

    const membership = await Membership.findOneAndDelete({
        user: userId,
        community: communityId,
    });

    if (!membership) {
        const error = new Error("You are not a member of this community.");
        error.statusCode = 404;
        throw error;
    }

    // Leaving removes membership only.
    // The creator remains the moderator through community.creator.

    return getSafeCommunity(community);
};