# HIVE
## Software Requirements Specification and Development Documentation

**Project:** Reddit Clone  
**Version:** 1.2  
**Last updated:** 25 November 2026  
**Team:** Omar, Ali, Hagar  
**Current development stage:** Backend foundation and database models completed; authentication implementation in progress.

---

# 1. Project Overview

Hive is a social discussion platform inspired by Reddit. Users can create communities, join communities, publish text and image posts, vote on posts, and participate in discussions through comments and nested replies.

The project uses the MERN stack:

- **MongoDB Atlas** — Database
- **Express.js** — Backend framework
- **React.js** — Frontend framework
- **Vite** — Frontend build tool
- **React Router** — Client-side routing
- **Tailwind CSS** — Styling
- **Node.js** — Backend runtime
- **Mongoose** — MongoDB object modeling

The primary objective is to complete all required features before optional bonus features.

# 2. Project Scope

## 2.1 Required Features

Hive must provide:

1. Account registration and login.
2. Viewing and editing user profiles.
3. Creating communities.
4. Joining and leaving communities.
5. Creating text and image posts.
6. Viewing community posts and the main feed.
7. Upvoting and downvoting posts.
8. Commenting and replying through nested threads.
9. Searching for communities and users.
10. Sorting posts by New and Top.
11. Loading additional posts through pagination.
12. Editing and deleting users' own posts and comments.
13. Community moderation.
14. AI-powered post summarization.

## 2.2 Bonus Features

These will be considered after required features are complete:

- Chat.
- Deployment.
- Additional features that improve the platform.

# 3. User Roles and Access Rules

## 3.1 Guest

Guests can:

- Browse public communities and public posts.
- Search for communities and users.
- View public user profiles.
- Register and log in.

Guests cannot:

- View comments or post scores.
- Create posts or communities.
- Join or leave communities.
- Vote, comment, or reply.
- Edit or delete content.
- Request AI summaries.

## 3.2 Registered User

Registered users can:

- View and edit their own profiles.
- View public profiles.
- Create multiple communities.
- Join and leave communities.
- Create text and image posts.
- Edit and delete their own posts.
- Upvote, downvote, switch, and remove votes.
- Comment and reply to comments.
- Edit and delete their own comments.
- Search, sort, paginate, and request AI summaries.

## 3.3 Community Moderator

The original creator of a community is its moderator.

Moderators can remove posts and comments in their own community. Moderator permissions are not global.

**Ownership rule:** Leaving a community removes the creator's membership, but does not remove their creator status or moderator privileges. Ownership is stored on the Community document, separately from Membership records.

# 4. Functional Requirements

## 4.1 Authentication

Users register with a username, email, and password. The backend validates the submitted data and stores only a securely hashed password. Login establishes an authenticated session/token, and protected endpoints require authentication.

## 4.2 User Profiles

Each user has a public profile. Users may edit only their own profile. Profiles can display user information and their posts and comments.

## 4.3 Communities

A community contains:

- Name.
- Description.
- Creator.
- Creation and update timestamps.
- Membership relationships.

Community names are unique. A user may create multiple communities. The creator automatically receives moderator privileges, which remain even if they leave the community.

## 4.4 Posts

Posts belong to one community and have one author. A post contains:

- Title.
- Optional text content.
- Optional image URL.
- Author reference.
- Community reference.
- Upvote and downvote counters.
- Calculated score.
- Comment count.
- Creation and update timestamps.

A post must contain text content, an image, or both. Only its author can edit it. Its author or the relevant community moderator can remove it, subject to authorization rules.

## 4.5 Main Feed

The main feed combines posts from communities the user has joined with popular public posts.

Sorting options:

- **New:** Newest posts first.
- **Top:** Higher-scoring posts first.

Pagination uses a **Load More** button.

## 4.6 Voting

A user can have at most one active vote on a post.

- `1` represents an upvote.
- `-1` represents a downvote.
- Removing a vote deletes the active vote record.

The post score is:

`score = upvotes - downvotes`

Vote creation, switching, and removal must update the post counters consistently. The backend and database must protect against duplicate votes and concurrent updates.

## 4.7 Comments and Nested Replies

A comment contains content, author, post, optional parent comment, and timestamps.

- A top-level comment has `parentComment: null`.
- A reply references its parent comment.
- Comments and replies are associated with the original post.
- Users can edit or delete their own comments.
- Community moderators can remove comments in their community.

## 4.8 Search

Users can search for communities and users and open the corresponding community page or public profile.

## 4.9 AI Post Summarization

An authenticated user can request a summary of a post. The backend sends the relevant post content to an AI service and returns the generated summary. The original post must remain unchanged.

The AI provider and model are still to be selected and integrated.

# 5. Main User Workflows

## 5.1 Registration

1. Visitor opens the registration page.
2. Visitor submits username, email, and password.
3. Backend validates the data.
4. Backend hashes the password.
5. Backend creates the user account.
6. The user can authenticate.

## 5.2 Community Creation and Membership

1. An authenticated user submits a community name and description.
2. Backend checks the unique community name.
3. Backend creates the community with the creator's user ID.
4. The creator is treated as the moderator.
5. Membership is recorded separately.
6. Leaving deletes the membership record only; it does not change the Community creator field.

## 5.3 Post Creation

1. User selects a community.
2. User submits a title and optional text and image.
3. Backend validates the post and its community.
4. Backend stores the post.
5. The post appears in the community and eligible feeds.

## 5.4 Voting

1. User selects upvote or downvote.
2. Backend checks the user's existing vote for that post.
3. Backend creates, switches, or removes the vote.
4. Backend updates the post counters and score consistently.
5. Frontend displays the resulting state.

## 5.5 Comments

1. User opens a post.
2. User submits a comment or reply.
3. Backend stores the comment with its post and optional parent comment.
4. The discussion displays the nested thread.

# 6. Technical Architecture

## 6.1 Frontend

The frontend is a React application built with Vite, React Router, and Tailwind CSS.

Current frontend structure:

```text
frontend/
  public/
  src/
    assets/
    components/
    context/
    hooks/
    layouts/
    pages/
    services/
      api.js
    App.jsx
    App.css
    index.css
    main.jsx
  index.html
  vite.config.js
  package.json
```

The frontend pages include the home feed, authentication, community page, post creation, and post details. The API service is located at `src/services/api.js`; backend integration is part of the remaining work.

## 6.2 Backend

The backend uses Node.js, Express, and Mongoose. It follows a layered structure:

- **Routes:** Define API endpoints.
- **Middleware:** Handle authentication, uploads, and errors.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Contain application/business logic.
- **Models:** Define MongoDB document schemas.
- **Config:** Holds application and database configuration.
- **Utils:** Shared helpers and error classes.

Current backend structure:

```text
backend/
  .env
  .env.example
  package.json
  src/
    app.js
    server.js
    config/
      config.js
      db.js
    controllers/
      auth.controller.js
      comment.controller.js
      community.controller.js
      post.controller.js
      user.controller.js
      vote.controller.js
    middleware/
      auth.middleware.js
      error.middleware.js
      upload.middleware.js
    models/
      Comment.js
      Community.js
      Membership.js
      Post.js
      User.js
      Vote.js
    routes/
      auth.routes.js
      comment.routes.js
      community.routes.js
      post.routes.js
      user.routes.js
      vote.routes.js
    services/
      auth.service.js
      comment.service.js
      community.service.js
      post.service.js
      vote.service.js
    utils/
      ApiError.js
      asyncHandler.js
```

Some scaffolded controllers, routes, middleware, services, and utilities are still awaiting implementation.

## 6.3 Backend Startup and Configuration

- `src/server.js` connects to MongoDB before starting the HTTP server.
- `src/config/config.js` loads environment-based configuration.
- `src/config/db.js` connects to MongoDB using Mongoose.
- `src/app.js` configures Express, security headers, CORS, JSON parsing, URL-encoded parsing, cookies, and the health endpoint.
- Environment secrets and database credentials belong in `.env` and must not be committed to Git.

The backend uses ES modules (`"type": "module"`).

# 7. Database Design

Hive uses six main MongoDB collections. References are stored using Mongoose ObjectIds.

## 7.1 User

**File:** `src/models/User.js`

Fields:

- `username` — required, unique, lowercase, 3–30 characters.
- `email` — required, unique, lowercase.
- `password` — required and excluded from normal query selection.
- `bio` — optional, maximum 300 characters.
- `avatar` — optional URL/string.
- `createdAt`, `updatedAt` — automatic timestamps.

Passwords are to be hashed by the authentication service using bcrypt before a user is saved.

## 7.2 Community

**File:** `src/models/Community.js`

Fields:

- `name` — required, unique, lowercase, 3–30 characters.
- `description` — optional, maximum 500 characters.
- `creator` — required reference to User.
- `createdAt`, `updatedAt` — automatic timestamps.

The creator reference is independent of membership so creator moderation rights survive leaving.

## 7.3 Membership

**File:** `src/models/Membership.js`

Fields:

- `user` — required reference to User.
- `community` — required reference to Community.
- `joinedAt` — membership creation time.

Indexes:

- Unique compound index `{ user: 1, community: 1 }` prevents duplicate membership.
- Index `{ community: 1, joinedAt: -1 }` supports listing community members.

## 7.4 Post

**File:** `src/models/Post.js`

Fields:

- `title` — required, maximum 200 characters.
- `content` — optional text, maximum 10,000 characters.
- `image` — optional image URL.
- `author` — required User reference.
- `community` — required Community reference.
- `upvotes`, `downvotes` — cached vote counters.
- `score` — cached score (`upvotes - downvotes`).
- `commentCount` — cached comment count.
- `createdAt`, `updatedAt` — automatic timestamps.

Indexes:

- `{ community: 1, createdAt: -1 }` for newest community posts.
- `{ score: -1, createdAt: -1 }` for top posts.
- `{ author: 1, createdAt: -1 }` for a user's posts.

The backend must maintain cached counters when votes or comments change.

## 7.5 Vote

**File:** `src/models/Vote.js`

Fields:

- `user` — required User reference.
- `post` — required Post reference.
- `value` — required number; allowed values are `1` and `-1`.
- `createdAt`, `updatedAt` — automatic timestamps.

Indexes:

- Unique compound index `{ user: 1, post: 1 }` guarantees at most one vote record per user and post.
- Index `{ post: 1 }` supports retrieving votes for a post.

The voting service is responsible for keeping Vote records and Post counters consistent. Transaction-based updates should be used for multi-document vote changes where supported by the MongoDB deployment.

## 7.6 Comment

**File:** `src/models/Comment.js`

Fields:

- `content` — required, maximum 5,000 characters.
- `author` — required User reference.
- `post` — required Post reference.
- `parentComment` — optional self-reference to another Comment; null for top-level comments.
- `createdAt`, `updatedAt` — automatic timestamps.

Indexes:

- `{ post: 1, parentComment: 1, createdAt: 1 }` for retrieving comment threads.
- `{ author: 1, createdAt: -1 }` for a user's comments.

## 7.7 Relationship Overview

```text
User
 ├── creates ──> Community (creator)
 ├── joins ────> Community through Membership
 ├── writes ───> Post
 ├── votes ────> Post through Vote
 └── writes ───> Comment

Community
 ├── has one creator (User)
 ├── has many Membership records
 └── contains many Posts

Post
 ├── belongs to one Community
 ├── has one author (User)
 ├── has many Vote records
 └── has many Comment records

Comment
 ├── belongs to one Post
 ├── has one author (User)
 └── may reference a parent Comment
```

# 8. API Design Plan

The backend API is organized by resource. The endpoint list below is a planning outline; endpoints should be marked implemented only after they exist and have been tested.

| Resource | Planned operations |
|---|---|
| Authentication | Register, login, logout, current user |
| Users | Public profile, update own profile, user posts/comments |
| Communities | Create, list/search, details, update/delete where authorized |
| Memberships | Join, leave, membership status |
| Posts | Create, list feed, list community posts, details, edit, delete |
| Votes | Create/switch/remove vote, retrieve own vote state |
| Comments | List, create, reply, edit, delete |
| AI | Generate a post summary |

API documentation will be finalized after route implementation and testing. Swagger or a Postman collection can be used for the final API reference.

# 9. Security, Validation, and Reliability Rules

1. Passwords must never be stored in plaintext.
2. Password hashes must not be returned in API responses.
3. Protected endpoints must require authentication.
4. Backend authorization must verify authorship and moderator permissions.
5. A community creator remains its moderator after leaving.
6. Community names, usernames, and emails must be unique as specified by their schemas.
7. A user may have at most one active vote per post.
8. Vote and score updates must remain correct under concurrent requests.
9. Guests must not receive comments or post scores.
10. Guests must not request AI summaries.
11. AI summarization must not modify the original post.
12. Invalid requests and duplicate-key errors must produce appropriate API responses.
13. Secrets must be stored in environment variables, not source control.
14. Database operations that update multiple related documents must preserve consistency.

# 10. UI Requirements

The UI should resemble Reddit's general layout and interaction patterns.

Main interface areas include:

- Navigation bar and search.
- Main feed.
- Community navigation/sidebar.
- Post cards.
- Community pages.
- User profiles.
- Post detail pages.
- Nested comment sections.
- Login and registration pages.
- Create community and create post interfaces.

## 10.1 Color Palette

Hive uses a dark-mode palette:

| Token | Hex | Usage |
|---|---|---|
| Obsidian Ink (`obsidian`) | `#151311` | Main page background |
| Obsidian Light (`obsidian-light`) | `#1E1A18` | Cards, forms, elevated panels |
| Obsidian Border (`obsidian-border`) | `#2E2624` | Borders and dividers |
| Velvet Curfew (`velvet`) | `#4B262F` | Community banners and active elements |
| Velvet Hover (`velvet-hover`) | `#5E303B` | Secondary hover states |
| Velvet Muted (`velvet-muted`) | `#321A20` | AI summary container and highlights |
| Almond Hearth (`almond`) | `#EED3BA` | Primary text and primary actions |
| Almond Muted (`almond-muted`) | `#B89E89` | Secondary text and metadata |
| Almond Dark (`almond-dark`) | `#D8B99C` | Primary action hover states |

## 10.2 Frontend Route Map

| Route | Page | Purpose |
|---|---|---|
| `/` | `HomeFeedPage` | Main feed, New/Top sorting, Load More |
| `/login` | `AuthPage` | Login |
| `/register` | `AuthPage` | Registration |
| `/r/:communityName` | `CommunityPage` | Community details, membership, posts |
| `/post/:postId` | `PostDetailPage` | Post details, AI summary, comments |
| `/submit` | `CreatePostPage` | Create text/image post |
| `/u/:username` | `ProfilePage` | Public profile and owner editing |
| `/search` | `SearchPage` | Search users and communities |

## 10.3 Reusable Components

Planned reusable components include:

- `Layout` — Navigation and community sidebar.
- `PostCard` — Post details and interaction controls.
- `CommentItem` — Recursive nested comment display.
- `CommunityHeader` — Community information, membership, and moderator actions.

# 11. Development Plan

**Priority 1 — Core Platform**

- Authentication and profiles.
- Communities and memberships.
- Posts and main feed.

**Priority 2 — Interactions**

- Voting.
- Comments and nested replies.
- Editing and deleting.
- Moderation.

**Priority 3 — Additional Required Functionality**

- Search.
- Sorting and pagination.
- Image uploads.
- AI summarization.

**Priority 4 — Finalization**

- Testing.
- API documentation.
- Database schema diagram.
- Code cleanup.

**Priority 5 — Bonuses**

- Chat.
- Deployment.
- Additional features.

# 12. Current Development Status

Status reflects work completed as of **25 November 2026**.

| Area | Status | Notes |
|---|---|---|
| Requirements and permissions | Completed | Core behavior and moderation rules decided |
| Frontend implementation | Completed | React/Vite frontend built |
| Backend project structure | Completed | Express layered folder structure created |
| Backend configuration | Completed | Environment configuration implemented |
| Express server | Completed | Server starts successfully |
| MongoDB Atlas connection | Completed | Successful connection to the `hive` database |
| Health endpoint | Tested | `GET /api/health` returned a successful response |
| User model | Implemented | User schema created |
| Community model | Implemented | Community schema created |
| Membership model | Implemented | Membership schema and indexes created |
| Post model | Implemented | Post schema and indexes created |
| Vote model | Implemented | Vote schema and unique compound index created |
| Comment model | Implemented | Comment schema and nested reply reference created |
| Model syntax verification | Pending confirmation | Run `node --check` for all six model files |
| Authentication service | In progress | Registration logic is the current implementation task |
| Login and JWT | Not started | Next authentication tasks |
| Authentication middleware | Not started | Protect private endpoints |
| API routes/controllers | Not started | Scaffold files exist; implementation remains |
| Communities and posts services | Not started | To follow authentication |
| Voting and comments services | Not started | To follow core resources |
| Image upload integration | Not started | Storage provider not selected |
| AI integration | Not started | Provider/model not selected |
| Frontend-backend integration | Not started | API client integration remains |
| Testing | Not started | Unit/integration and manual API tests |
| API documentation | Not started | Finalize after endpoint implementation |
| Database diagram | Not started | Generate from final schema |
| Deployment and bonus features | Not started | After required features |

## 12.1 Immediate Next Steps

1. Finish registration service and test validation/password hashing.
2. Implement login and JWT generation.
3. Implement authentication middleware.
4. Implement logout and current-user endpoint.
5. Test authentication endpoints.
6. Continue with user profiles, communities, and memberships.

---

**End of Hive Software Requirements and Development Documentation — Version 1.2**
