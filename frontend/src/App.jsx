import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import HomeFeedPage from "./pages/HomeFeedPage";
import PostDetailPage from "./pages/PostDetailPage";
import CommunityPage from "./pages/CommunityPage";
import { AuthPage } from "./pages/AuthPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import SearchPage from "./pages/SearchPage";
import UserProfilePage from "./pages/UserProfilePage";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian text-almond flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        <Route
          path="/"
          element={
            <Layout>
              <HomeFeedPage />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <SearchPage />
            </Layout>
          }
        />
        <Route
          path="/r/:communityName"
          element={
            <Layout>
              <CommunityPage />
            </Layout>
          }
        />
        <Route
          path="/post/:postId"
          element={
            <Layout>
              <PostDetailPage />
            </Layout>
          }
        />
        <Route
          path="/submit"
          element={
            <Layout>
              <CreatePostPage />
            </Layout>
          }
        />
        <Route
          path="/u/:username"
          element={
            <Layout>
              <UserProfilePage />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
