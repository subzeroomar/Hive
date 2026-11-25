import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomeFeedPage from "./pages/HomeFeedPage";
import PostDetailPage from "./pages/PostDetailPage";
import CommunityHeader from "./pages/CommunityPage";
import { AuthPage } from "./pages/AuthPage";
import { CreatePostPage } from "./pages/CreatePostPage";

// Temporary mock data so pages render cleanly
const mockCommunities = [
  { id: 1, name: "webdev", description: "Everything about web development." },
  { id: 2, name: "design", description: "UI/UX and visual design discussions." },
];

const mockPosts = [
  {
    id: 1,
    community: "webdev",
    author: "hagar",
    createdAt: "2h ago",
    title: "Just set up Tailwind CSS for our HIVE project!",
    content: "Obsidian Ink, Velvet Curfew, and Almond Hearth look really clean together.",
    score: 42,
    commentCount: 2,
  },
];

const mockComments = [
  {
    id: 101,
    author: "omar",
    authorId: "u2",
    createdAt: "1h ago",
    content: "Looks awesome! Are we using MongoDB for the backend?",
    replies: [
      {
        id: 102,
        author: "ali",
        authorId: "u3",
        createdAt: "30m ago",
        content: "Yep, full MERN stack.",
        replies: [],
      },
    ],
  },
];

export default function App() {
  const isLoggedIn = true; // Flip to false to test the Guest view

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages (no sidebar/navbar) */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        {/* Main pages wrapped in the Reddit-style Layout */}
        <Route
          path="/"
          element={
            <Layout isLoggedIn={isLoggedIn}>
              <HomeFeedPage posts={mockPosts} isLoggedIn={isLoggedIn} />
            </Layout>
          }
        />
        <Route
          path="/r/:communityName"
          element={
            <Layout isLoggedIn={isLoggedIn}>
              <CommunityHeader
                community={mockCommunities[0]}
                isJoined={true}
                isMod={true}
                isLoggedIn={isLoggedIn}
              />
              <HomeFeedPage posts={mockPosts} isLoggedIn={isLoggedIn} />
            </Layout>
          }
        />
        <Route
          path="/post/:postId"
          element={
            <Layout isLoggedIn={isLoggedIn}>
              <PostDetailPage
                post={mockPosts[0]}
                comments={mockComments}
                aiSummary="The author set up Tailwind CSS with the team's custom dark color palette for HIVE."
                isLoggedIn={isLoggedIn}
                isMod={true}
              />
            </Layout>
          }
        />
        <Route
          path="/submit"
          element={
            <Layout isLoggedIn={isLoggedIn}>
              <CreatePostPage communities={mockCommunities} />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}