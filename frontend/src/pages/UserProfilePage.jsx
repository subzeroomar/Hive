// src/pages/UserProfilePage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, updateMyProfile } from "../services/api";
import { PostCard } from "./HomeFeedPage";
import { formatTime } from "../utils/formatTime";

export default function UserProfilePage() {
  const { username } = useParams();
  const { user, isLoggedIn, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setEditing(false);
    setSaveMessage("");

    getUserProfile(username)
      .then((res) => {
        if (cancelled) return;
        const loaded = res.data.user;
        setProfile(loaded);
        setPosts(res.data.posts || []);
        setComments(res.data.comments || []);
        setBio(loaded.bio || "");
        setAvatar(loaded.avatar || "");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username, isLoggedIn]);

  const isOwnProfile = Boolean(
    user &&
      profile &&
      user.username?.toLowerCase() === profile.username?.toLowerCase()
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaveMessage("");
    try {
      const res = await updateMyProfile({ bio, avatar: avatar.trim() });
      setProfile(res.data.user);
      updateUser({ bio: res.data.user.bio, avatar: res.data.user.avatar });
      setEditing(false);
      setSaveMessage("Profile updated!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-almond-muted">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center rounded-xl bg-obsidian-light border border-obsidian-border text-sm text-red-400">
        {error || "User not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-obsidian-light border border-obsidian-border rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-velvet text-almond font-bold flex items-center justify-center text-2xl overflow-hidden shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.username?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-almond">
                u/{profile.username}
              </h1>
              {profile.createdAt && (
                <p className="text-xs text-almond-muted mt-0.5">
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => {
                setEditing((v) => !v);
                setError("");
                setSaveMessage("");
              }}
              className="px-4 py-1.5 rounded-full border border-almond text-almond hover:bg-velvet/40 text-xs font-medium cursor-pointer"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        {saveMessage && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/40 text-green-400 text-sm">
            {saveMessage}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs text-almond-muted mb-1">
                Bio (max 300 characters)
              </label>
              <textarea
                rows="3"
                maxLength={300}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
                className="w-full px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond focus:outline-none focus:border-almond"
              />
            </div>
            <div>
              <label className="block text-xs text-almond-muted mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond focus:outline-none focus:border-almond"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-1.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-almond/90 whitespace-pre-line">
            {profile.bio || "This user hasn't added a bio yet."}
          </p>
        )}
      </div>

      {/* Tabs for User Posts & Comments */}
      <div className="flex items-center gap-2 pb-2 border-b border-obsidian-border">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
            activeTab === "posts"
              ? "bg-velvet text-almond"
              : "hover:bg-obsidian-light text-almond-muted"
          }`}
        >
          Posts ({posts.length})
        </button>
        {isLoggedIn && (
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
              activeTab === "comments"
                ? "bg-velvet text-almond"
                : "hover:bg-obsidian-light text-almond-muted"
            }`}
          >
            Comments ({comments.length})
          </button>
        )}
      </div>

      {activeTab === "posts" ? (
        posts.length === 0 ? (
          <p className="text-sm text-almond-muted text-center py-6">
            No posts yet.
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLoggedIn={isLoggedIn}
                isAuthor={isOwnProfile}
                isMod={Boolean(
                  user &&
                    post.community?.creator &&
                    String(user.id) === String(post.community.creator)
                )}
                onUpdated={(updated) =>
                  setPosts((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p))
                  )
                }
                onDeleted={(deletedId) =>
                  setPosts((prev) => prev.filter((p) => p.id !== deletedId))
                }
              />
            ))}
          </div>
        )
      ) : comments.length === 0 ? (
        <p className="text-sm text-almond-muted text-center py-6">
          No comments yet.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-obsidian-light border border-obsidian-border space-y-1"
            >
              <div className="text-xs text-almond-muted flex items-center gap-2">
                <span>Commented on</span>
                {c.post ? (
                  <Link
                    to={`/post/${c.post.id}`}
                    className="text-almond font-medium hover:underline"
                  >
                    {c.post.title}
                  </Link>
                ) : (
                  <span>a post</span>
                )}
                <span>•</span>
                <span>{formatTime(c.createdAt)}</span>
              </div>
              <p className="text-sm text-almond/90 whitespace-pre-line">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
