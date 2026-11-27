import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomeFeedPage from "./pages/HomeFeedPage";
import PostDetailPage from "./pages/PostDetailPage";
import CommunityHeader from "./pages/CommunityPage";
import { AuthPage } from "./pages/AuthPage";
import { CreatePostPage } from "./pages/CreatePostPage";


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
    title: "Cat?",
    content: "cat cat cat",
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
    content: "meow",
    replies: [
      {
        id: 102,
        author: "ali",
        authorId: "u3",
        createdAt: "30m ago",
        content: "what?",
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
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

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
                aiSummary="The author said AI sucks"
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