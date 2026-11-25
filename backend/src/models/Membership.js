
import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: true,
    },

    joinedAt: {
        type: Date,
        default: Date.now,
    },
});

// A user can join a community only once.
membershipSchema.index(
    { user: 1, community: 1 },
    { unique: true }
);

// Helps retrieve a community's members efficiently.
membershipSchema.index(
    { community: 1, joinedAt: -1 }
);

const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;
