# HIVE
## Software Requirements Specification (SRS)
**Project:** Reddit Clone  
**Version:** 1.0  
**Status:** Phase 1 — Requirements Analysis  
**Team:** Omar, Ali, Hagar

---

# 1. Project Overview

Hive is a social discussion platform inspired by Reddit. Users can create communities, join existing communities, publish posts, share images, vote on posts, and participate in discussions through comments and replies.

The platform will provide a familiar Reddit-like experience, with a user interface that closely matches Reddit's general layout and functionality.

The project will be developed using the MERN stack:

- MongoDB — Database
- Express.js — Backend framework
- React.js — Frontend framework
- Node.js — Runtime environment

The main objective is to implement all required features before spending time on optional bonus features.

# 2. Project Scope

## 2.1 Required Features

Hive must provide:

1. Account creation and login.
2. Viewing and editing user profiles.
3. Creating communities.
4. Joining and leaving communities.
5. Creating text and image posts inside communities.
6. Viewing posts belonging to a community.
7. Viewing the main feed.
8. Upvoting and downvoting posts.
9. Commenting on posts.
10. Searching for communities and users.
11. Replying to comments through nested comment threads.
12. Sorting posts and loading them through pagination.
13. Editing and deleting users' own posts and comments.
14. Community moderation.
15. AI-powered post summarization.

## 2.2 Bonus Features

These will be considered after all required features are completed:

- Chatting feature.
- Deployment.
- Additional features that improve the platform.

# 3. User Roles

Hive has three access categories.

## 3.1 Guest

A guest is a visitor who is not logged in.

Guests can:
- Browse public communities.
- Browse public posts.
- Search for users and communities.
- View public user profiles.
- Register for an account.
- Log in.

Guests cannot:
- View comments.
- View post scores.
- Create posts or communities.
- Join or leave communities.
- Vote on posts.
- Comment or reply.
- Edit or delete content.
- Request AI summaries.

Guests must log in to access interactive features and restricted content.

## 3.2 Registered User

A registered user is someone who has logged in.

Registered users can:

**Account**
- View their own profile.
- Edit their own profile.
- View other public profiles.

**Communities**
- Create multiple communities.
- Join communities.
- Leave communities.
- Browse communities.

**Posts**
- Create text posts.
- Create image posts.
- Edit their own posts.
- Delete their own posts.

**Interactions**
- Upvote posts.
- Downvote posts.
- Switch or remove their votes.
- Comment on posts.
- Reply to comments.
- Edit their own comments.
- Delete their own comments.

**Other**
- Search for communities and users.
- Sort posts.
- Load additional posts.
- Request AI-generated post summaries.

## 3.3 Community Moderator

A moderator is the original creator of a community.

Moderators have all registered-user permissions, plus:

- Remove posts created by other users in their community.
- Remove comments created by other users in their community.

Moderator permissions are restricted to the community they created.

**Important rules:**
- The creator automatically becomes the moderator.
- Leaving the community does not remove moderator privileges.
- Moderator privileges are not transferred simply because the creator leaves.
- A user can moderate one community and be an ordinary member of another.

# 4. Functional Requirements

## 4.1 Authentication

The system must allow users to:

- Register using a username, email, and password.
- Log in using their credentials.
- Access protected features after successful authentication.
- Log out of their account.

The system must validate registration data and securely store passwords using password hashing.

## 4.2 User Profiles

Each user must have a profile.

Users must be able to:
- View their profile.
- Edit their own profile information.
- View other users' public profiles.
- See their own posts and comments.

Users must not be able to edit another user's profile.

## 4.3 Communities

Users must be able to create communities.

A community should contain:
- Community name.
- Description.
- Creator/owner.
- Creation date.
- Membership information.

Business rules:
- Community names must be unique.
- A user can create multiple communities.
- The creator automatically becomes the moderator.
- Users can join and leave communities.
- A creator retains moderator privileges even after leaving.

## 4.4 Posts

Users must be able to create posts inside communities.

Hive will support:
- Text posts.
- Image posts.

A post should contain:
- Title.
- Text content.
- Optional image.
- Author.
- Community.
- Creation date.
- Updated date.

Business rules:
- Every post belongs to one community.
- Every post has one author.
- Only the author can edit their post.
- The author can delete their own post.
- The community moderator can remove posts from their community.

## 4.5 Main Feed

The main feed will display a mixture of:

- Posts from communities the user has joined.
- Popular public posts.

The feed must support sorting and pagination.

Sorting options:

**New:** Displays the newest posts first.

**Top:** Displays posts according to their scores, with higher-scoring posts appearing first.

Pagination will use a **Load More** button.

The frontend initially loads a limited number of posts. Clicking Load More requests the next group of posts.

## 4.6 Community Pages

Each community must have its own page.

The page should display:
- Community name.
- Description.
- Join/Leave button.
- Community posts.
- Post sorting options.
- Load More button.

Community moderators must also have access to moderation actions.

## 4.7 Voting System

Users must be able to:
- Upvote posts.
- Downvote posts.
- Switch their vote.
- Remove their vote.

The score is calculated as:

Score = Total Upvotes - Total Downvotes

A user can have at most one active vote on a particular post.

Example:

| Action | Score |
|---|---:|
| Initial score | 0 |
| User A upvotes | +1 |
| User B upvotes | +2 |
| User A changes to downvote | 0 |
| User B removes their vote | -1 |

**Critical backend requirement:**

The voting system must correctly handle simultaneous requests. Duplicate votes and incorrect score updates must be prevented.

The backend and database design must guarantee the voting rules, rather than relying only on frontend validation.

## 4.8 Comments and Nested Replies

Users must be able to comment on posts.

Each comment should contain:
- Comment content.
- Author.
- Associated post.
- Parent comment, if it is a reply.
- Creation date.
- Updated date.

Users must be able to:
- Create comments.
- Reply to comments.
- Edit their own comments.
- Delete their own comments.

The system must support nested comment threads.

A reply must be associated with its parent comment.

Community moderators can remove comments within their communities.

## 4.9 Search

Hive must provide search functionality for:

- Communities.
- Users.

Search results should allow users to open the corresponding community or user profile.

## 4.10 Editing and Deleting Content

Authorization rules:

- Users can edit their own posts.
- Users can delete their own posts.
- Users can edit their own comments.
- Users can delete their own comments.
- Community moderators can remove posts and comments belonging to their community.

Users must not be allowed to modify other users' content without the appropriate moderator permissions.

## 4.11 Community Moderation

The creator of a community is its moderator.

Moderators can:
- Remove posts from their community.
- Remove comments from their community.

Moderation permissions must be verified by the backend.

A moderator cannot moderate another community unless they are its creator.

## 4.12 AI Post Summarization

Hive must integrate generative AI to summarize posts.

Workflow:

1. A user opens a post.
2. The user clicks the Summarize button.
3. The frontend sends the post content to the backend.
4. The backend communicates with the generative AI service.
5. The AI generates a shorter summary.
6. The summary is displayed to the user.

The original post must remain unchanged.

Only authenticated users can request summaries.

# 5. Website Access Rules

| Content or action | Guest | Logged-in user |
|---|---|---|
| View public communities | Yes | Yes |
| View public posts | Yes | Yes |
| View comments | No | Yes |
| View post scores | No | Yes |
| Search communities | Yes | Yes |
| Search users | Yes | Yes |
| View public profiles | Yes | Yes |
| Create posts | No | Yes |
| Create communities | No | Yes |
| Vote | No | Yes |
| Comment and reply | No | Yes |
| Join/leave communities | No | Yes |
| Request AI summaries | No | Yes |

# 6. Main User Workflows

## 6.1 Registration Workflow

1. Visitor opens Hive.
2. Visitor selects Sign Up.
3. Visitor enters the required information.
4. Backend validates the information.
5. Password is hashed.
6. User account is created.
7. User can log in.

## 6.2 Community Creation Workflow

1. Logged-in user selects Create Community.
2. User enters the community name and description.
3. Backend checks whether the name is already used.
4. If available, the community is created.
5. Creator becomes the community moderator.

## 6.3 Joining a Community Workflow

1. User opens a community.
2. User selects Join.
3. Membership is recorded.
4. The interface updates to show that the user has joined.

Leaving a community removes the user's membership. If the user is its creator, their moderator privileges remain.

## 6.4 Post Creation Workflow

1. User opens a community.
2. User selects Create Post.
3. User enters a title and content.
4. User optionally uploads an image.
5. User submits the post.
6. Backend validates and stores the post.
7. Post appears in the community and eligible feeds.

## 6.5 Voting Workflow

1. User opens a post.
2. User selects Upvote or Downvote.
3. Backend checks the user's existing vote.
4. Backend creates, switches, or removes the vote.
5. Post score is updated correctly.
6. Frontend displays the updated score.

## 6.6 Comment Workflow

1. User opens a post.
2. User writes a comment.
3. Backend stores the comment.
4. Comment appears in the discussion.
5. Other users can reply to it.

## 6.7 AI Summary Workflow

1. User opens a post.
2. User selects Summarize.
3. Backend sends the post content to the AI service.
4. AI returns a summary.
5. Frontend displays the summary.

# 7. Business Rules and Validation

The following rules must always be enforced:

1. A user must be authenticated to interact with Hive.
2. Community names must be unique.
3. A user can create multiple communities.
4. A community creator remains its moderator even after leaving.
5. Every post must belong to a community.
6. Only post authors can edit their posts.
7. Only comment authors can edit their comments.
8. Moderators can remove content in their own communities.
9. Each user can have at most one active vote per post.
10. Switching or removing a vote must update the score correctly.
11. Voting must remain correct under simultaneous requests.
12. Guests cannot view comments or post scores.
13. Guests cannot request AI summaries.
14. The original post must not be modified by AI summarization.

# 8. User Interface Requirements

The UI must resemble Reddit as closely as possible.

The interface should include:

- Main navigation bar.
- Search bar.
- Main feed.
- Community sidebar or navigation.
- Post cards.
- Community pages.
- User profiles.
- Post detail pages.
- Comment sections.
- Login and registration pages.
- Create community and create post interfaces.

The exact colors, logo, typography, and frontend styling will be decided during Phase 2 using the color palette supplied by the team.

# 9. Non-Functional Requirements

## Security
- Passwords must be hashed.
- Protected endpoints must require authentication.
- Backend authorization must verify ownership and moderator permissions.
- Users must not be able to access or modify unauthorized resources.

## Performance
- Posts must load using pagination.
- Search should return relevant results efficiently.
- Database queries should use appropriate indexes.
- Voting operations must be reliable under concurrent requests.

## Maintainability
- Code should be organized into clear modules.
- Frontend and backend responsibilities should be separated.
- Reusable components should be used where appropriate.
- Naming conventions should remain consistent.

## Reliability
- Invalid requests must be handled properly.
- Database operations must preserve data consistency.
- Errors should be returned in a consistent format.

# 10. Project Deliverables

According to the project instructions, the team must provide:

1. Complete codebase hosted on GitHub.
2. Database schema diagram.
3. API documentation.
4. Clear contributions from each team member.

API documentation should use a suitable tool such as Swagger or Postman.

The team must also ensure every member understands the code they contribute because individual discussion accounts for 30% of the grade.

# 11. Development Priorities

Development will follow this order:

**Priority 1 — Core Platform**
- Authentication.
- Profiles.
- Communities.
- Memberships.
- Posts.
- Main feed.

**Priority 2 — Interactions**
- Voting.
- Comments.
- Nested replies.
- Editing and deleting.
- Moderation.

**Priority 3 — Additional Required Functionality**
- Search.
- Sorting.
- Pagination.
- Image uploads.
- AI summarization.

**Priority 4 — Finalization**
- Testing.
- Documentation.
- Database schema diagram.
- Code cleanup.

**Priority 5 — Bonuses**
- Chat.
- Deployment.
- Additional features.

---

# 12. Project Status

| Phase | Status |
|---|---|
| Phase 1 — Requirements Analysis | In progress |
| Phase 2 — UI/UX Design | Not started |
| Phase 3 — Database Design | Not started |
| Phase 4 — Project Setup | Not started |
| Phase 5 — Authentication & Profiles | Not started |
| Phase 6 — Communities & Posts | Not started |
| Phase 7 — Interactions & Moderation | Not started |
| Phase 8 — AI Integration | Not started |
| Phase 9 — Testing & Documentation | Not started |
| Phase 10 — Deployment & Bonuses | Not started |

**End of Hive Requirements Specification — Version 1.0**
