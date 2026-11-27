import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Community from "./models/Community.js";
import Membership from "./models/Membership.js";
import Post from "./models/Post.js";
import Vote from "./models/Vote.js";
import Comment from "./models/Comment.js";

const DEMO_PASSWORD = "password123";

const DEMO_USERS = [
    {
        username: "omar",
        email: "omar@hive.dev",
        bio: "Full-stack builder working on MERN apps and backend architecture.",
        avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Omar",
    },
    {
        username: "hagar",
        email: "hagar@hive.dev",
        bio: "UI/UX enthusiast obsessed with dark themes and crisp typography.",
        avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Hagar",
    },
    {
        username: "ali",
        email: "ali@hive.dev",
        bio: "Systems tinkerer, indie gamer, and late-night debugger.",
        avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Ali",
    },
    {
        username: "maya",
        email: "maya@hive.dev",
        bio: "Cat photographer, frontend dev, and coffee connoisseur.",
        avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Maya",
    },
];

const DEMO_COMMUNITIES = [
    {
        name: "webdev",
        description: "Everything about modern web development, React, Node.js, and APIs.",
        creatorUsername: "omar",
    },
    {
        name: "design",
        description: "UI/UX, color palettes, typography, and visual design critiques.",
        creatorUsername: "hagar",
    },
    {
        name: "gaming",
        description: "Indie gems, RPGs, hardware setups, and game dev chatter.",
        creatorUsername: "ali",
    },
    {
        name: "cats",
        description: "Daily feline photos, chaos stories, and cat appreciation.",
        creatorUsername: "maya",
    },
];

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);

const DEMO_POSTS = [
    {
        communityName: "webdev",
        authorUsername: "omar",
        title: "Why we switched from polling to clean REST + optimistic state",
        content:
            "After testing a few patterns on our MERN project, keeping API helpers centralized in one module made auth headers and error handling way cleaner. What patterns do you swear by for small-to-medium React apps?",
        image: "",
        createdAt: hoursAgo(2),
        votes: [
            { username: "omar", value: 1 },
            { username: "hagar", value: 1 },
            { username: "ali", value: 1 },
            { username: "maya", value: 1 },
        ],
        comments: [
            {
                username: "hagar",
                content: "Centralizing fetch in api.js saved us so much boilerplate on every page.",
                replies: [
                    {
                        username: "omar",
                        content: "100%! Especially handling FormData and Bearer tokens in one place.",
                        replies: [
                            {
                                username: "ali",
                                content: "Agreed — zero duplicated error handling too.",
                            },
                        ],
                    },
                ],
            },
            {
                username: "maya",
                content: "Pair that with a small AuthContext and session restore becomes effortless.",
            },
        ],
    },
    {
        communityName: "design",
        authorUsername: "hagar",
        title: "Obsidian & Velvet: Crafting a warm dark mode palette",
        content:
            "Pure #000000 backgrounds can feel harsh on the eyes. Mixing warm charcoal (#151311) with deep burgundy accents (#4B262F) and almond text (#EED3BA) keeps contrast high without feeling sterile.",
        image: "https://picsum.photos/seed/hive-design-palette/900/500",
        createdAt: hoursAgo(5),
        votes: [
            { username: "hagar", value: 1 },
            { username: "omar", value: 1 },
            { username: "maya", value: 1 },
        ],
        comments: [
            {
                username: "maya",
                content: "The almond text on obsidian is super easy to read late at night.",
                replies: [
                    {
                        username: "hagar",
                        content: "Thanks! Warm off-whites beat pure #FFFFFF every time.",
                    },
                ],
            },
        ],
    },
    {
        communityName: "cats",
        authorUsername: "maya",
        title: "Cat? Cat.",
        content:
            "He sat directly on my mechanical keyboard right as I was about to push to main. Somehow he typed 47 semicolons and minimized VS Code.",
        image: "https://picsum.photos/seed/hive-cat-keyboard/900/500",
        createdAt: hoursAgo(8),
        votes: [
            { username: "maya", value: 1 },
            { username: "hagar", value: 1 },
            { username: "omar", value: 1 },
            { username: "ali", value: 1 },
        ],
        comments: [
            {
                username: "omar",
                content: "meow — clearly he was doing a code review.",
                replies: [
                    {
                        username: "ali",
                        content: "Ship his commit immediately.",
                    },
                ],
            },
        ],
    },
    {
        communityName: "gaming",
        authorUsername: "ali",
        title: "What indie game completely stole your weekend this year?",
        content:
            "Looking for something atmospheric with tight gameplay loops and a great soundtrack. Bonus points if it runs smoothly on a laptop without sounding like a jet engine.",
        image: "https://picsum.photos/seed/hive-indie-gaming/900/500",
        createdAt: hoursAgo(12),
        votes: [
            { username: "ali", value: 1 },
            { username: "omar", value: 1 },
        ],
        comments: [
            {
                username: "omar",
                content: "Hollow Knight and Balatro are unbeatable for laptop sessions.",
            },
            {
                username: "hagar",
                content: "Gris if you want pure visual art and chill vibes.",
            },
        ],
    },
    {
        communityName: "webdev",
        authorUsername: "ali",
        title: "MongoDB indexes that actually sped up our feed queries",
        content:
            "Adding compound indexes on { community: 1, createdAt: -1 } and { score: -1, createdAt: -1 } kept pagination snappy even as post counts grow. Don't forget unique compound indexes on { user: 1, post: 1 } for votes!",
        image: "",
        createdAt: hoursAgo(18),
        votes: [
            { username: "ali", value: 1 },
            { username: "omar", value: 1 },
            { username: "maya", value: 1 },
        ],
        comments: [
            {
                username: "omar",
                content: "Unique compound indexes save you from race-condition duplicate votes too.",
            },
        ],
    },
    {
        communityName: "design",
        authorUsername: "maya",
        title: "Minimalist desk setup inspiration for deep focus",
        content:
            "Cleared everything off my desk except a lamp, notebook, and monitor. Productivity jumped immediately.",
        image: "https://picsum.photos/seed/hive-desk-setup/900/500",
        createdAt: hoursAgo(24),
        votes: [
            { username: "maya", value: 1 },
            { username: "hagar", value: 1 },
        ],
        comments: [],
    },
    {
        communityName: "webdev",
        authorUsername: "hagar",
        title: "Tailwind CSS v4 Vite plugin first impressions",
        content:
            "Dropping tailwind.config.js in favor of CSS-first @theme tokens makes custom color systems way cleaner to maintain.",
        image: "",
        createdAt: hoursAgo(30),
        votes: [
            { username: "hagar", value: 1 },
            { username: "ali", value: -1 },
            { username: "omar", value: 1 },
        ],
        comments: [
            {
                username: "ali",
                content: "Still warming up to CSS-first config, but the build speed is wild.",
            },
        ],
    },
    {
        communityName: "gaming",
        authorUsername: "omar",
        title: "Unpopular opinion: 15-hour linear games > 120-hour open worlds",
        content:
            "Give me a tightly paced story with zero filler fetch quests any day of the week.",
        image: "",
        createdAt: hoursAgo(36),
        votes: [
            { username: "omar", value: 1 },
            { username: "hagar", value: 1 },
            { username: "maya", value: 1 },
        ],
        comments: [
            {
                username: "ali",
                content: "Hard agree. Respecting the player's time is underrated.",
            },
        ],
    },
    {
        communityName: "cats",
        authorUsername: "hagar",
        title: "Caught mid-yawn in golden hour light",
        content: "Zero thoughts, maximum drama.",
        image: "https://picsum.photos/seed/hive-cat-golden/900/500",
        createdAt: hoursAgo(42),
        votes: [
            { username: "hagar", value: 1 },
            { username: "maya", value: 1 },
        ],
        comments: [],
    },
    {
        communityName: "design",
        authorUsername: "omar",
        title: "Card spacing & visual hierarchy checklist for feeds",
        content:
            "Keep metadata muted and small at the top, let titles breathe with strong contrast, and group secondary actions into pill controls at the bottom.",
        image: "",
        createdAt: hoursAgo(48),
        votes: [{ username: "omar", value: 1 }],
        comments: [],
    },
    {
        communityName: "webdev",
        authorUsername: "maya",
        title: "Multipart image uploads with Multer + Express 5",
        content:
            "Validating MIME types, enforcing a 5MB cap, and serving /uploads with cross-origin resource policy headers makes local image uploads painless during development.",
        image: "https://picsum.photos/seed/hive-upload-code/900/500",
        createdAt: hoursAgo(54),
        votes: [
            { username: "maya", value: 1 },
            { username: "omar", value: 1 },
        ],
        comments: [],
    },
];

async function createNestedComments(postId, items, userMap, parentId = null) {
    let count = 0;
    for (const item of items) {
        const author = userMap.get(item.username);
        if (!author) continue;

        const comment = await Comment.create({
            content: item.content,
            author: author._id,
            post: postId,
            parentComment: parentId,
        });
        count += 1;

        if (item.replies?.length) {
            count += await createNestedComments(
                postId,
                item.replies,
                userMap,
                comment._id
            );
        }
    }
    return count;
}

async function seed() {
    await connectDB();

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
    const userMap = new Map();

    // 1. Seed users
    for (const u of DEMO_USERS) {
        let user = await User.findOne({ username: u.username });
        if (!user) {
            user = await User.create({
                username: u.username,
                email: u.email,
                password: hashedPassword,
                bio: u.bio,
                avatar: u.avatar,
            });
            console.log(`Created user: u/${user.username}`);
        } else {
            console.log(`User exists: u/${user.username}`);
        }
        userMap.set(u.username, user);
    }

    // 2. Seed communities
    const communityMap = new Map();
    for (const c of DEMO_COMMUNITIES) {
        const creator = userMap.get(c.creatorUsername);
        let community = await Community.findOne({ name: c.name });
        if (!community) {
            community = await Community.create({
                name: c.name,
                description: c.description,
                creator: creator._id,
            });
            console.log(`Created community: h/${community.name}`);
        } else {
            console.log(`Community exists: h/${community.name}`);
        }
        communityMap.set(c.name, community);
    }

    // 3. Seed memberships (every demo user joins all demo communities)
    for (const user of userMap.values()) {
        for (const community of communityMap.values()) {
            await Membership.updateOne(
                { user: user._id, community: community._id },
                { $setOnInsert: { user: user._id, community: community._id } },
                { upsert: true }
            );
        }
    }

    // 4. Seed posts, votes, and nested comments
    for (const p of DEMO_POSTS) {
        const community = communityMap.get(p.communityName);
        const author = userMap.get(p.authorUsername);
        if (!community || !author) continue;

        const existingPost = await Post.findOne({
            title: p.title,
            community: community._id,
        });

        if (existingPost) {
            console.log(`Post exists: "${p.title}"`);
            continue;
        }

        const post = await Post.create({
            title: p.title,
            content: p.content,
            image: p.image,
            author: author._id,
            community: community._id,
            createdAt: p.createdAt,
            updatedAt: p.createdAt,
        });

        // Votes
        let upvotes = 0;
        let downvotes = 0;
        for (const v of p.votes || []) {
            const voter = userMap.get(v.username);
            if (!voter) continue;
            await Vote.create({
                user: voter._id,
                post: post._id,
                value: v.value,
            });
            if (v.value === 1) upvotes += 1;
            else if (v.value === -1) downvotes += 1;
        }

        // Nested comments
        const commentCount = await createNestedComments(
            post._id,
            p.comments || [],
            userMap
        );

        await Post.findByIdAndUpdate(post._id, {
            $set: {
                upvotes,
                downvotes,
                score: upvotes - downvotes,
                commentCount,
            },
        });

        console.log(
            `Created post: "${p.title}" (score: ${upvotes - downvotes}, comments: ${commentCount})`
        );
    }

    console.log("\nSeed complete! Demo accounts (password: password123):");
    for (const u of DEMO_USERS) {
        console.log(`  - ${u.email} (u/${u.username})`);
    }

    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
