// src/pages/HomeFeedPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  deletePost,
  getCommunityPosts,
  getHomeFeed,
  updatePost,
  voteOnPost,
} from "../services/api";
import { formatTime } from "../utils/formatTime";

export function PostCard({
  post,
  isLoggedIn,
  isAuthor,
  isMod,
  onUpdated,
  onDeleted,
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content || "");
  const [editImage, setEditImage] = useState(post.image || "");
  const [editImageFile, setEditImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  const communityName =
    typeof post.community === "object" ? post.community?.name : post.community;
  const authorName =
    typeof post.author === "object" ? post.author?.username : post.author;

  const handleVote = async (value) => {
    if (!isLoggedIn || voting) return;
    setVoting(true);
    setError("");
    try {
      const res = await voteOnPost(post.id, value);
      onUpdated?.({
        ...post,
        upvotes: res.data.upvotes,
        downvotes: res.data.downvotes,
        score: res.data.score,
        userVote: res.data.userVote,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await updatePost(post.id, {
        title: editTitle,
        content: editContent,
        image: editImage,
        imageFile: editImageFile,
      });
      onUpdated?.(res.data.post);
      setEditImageFile(null);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const label = isMod && !isAuthor ? "remove this post as moderator" : "delete this post";
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;
    setError("");
    try {
      await deletePost(post.id);
      onDeleted?.(post.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <article className="bg-obsidian-light border border-obsidian-border hover:border-velvet rounded-xl p-4 transition">
      {/* Post Header */}
      <div className="flex items-center justify-between text-xs text-almond-muted mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {communityName && (
            <>
              <Link
                to={`/r/${communityName}`}
                className="font-semibold text-almond hover:underline"
              >
                h/{communityName}
              </Link>
              <span>•</span>
            </>
          )}
          <span>
            Posted by{" "}
            {authorName ? (
              <Link to={`/u/${authorName}`} className="hover:underline">
                u/{authorName}
              </Link>
            ) : (
              "u/unknown"
            )}
          </span>
          <span>•</span>
          <span>{formatTime(post.createdAt)}</span>
        </div>

        {/* Author / Mod Controls */}
        {isLoggedIn && (isAuthor || isMod) && (
          <div className="flex gap-2">
            {isAuthor && (
              <button
                onClick={() => {
                  setEditing((v) => !v);
                  setError("");
                }}
                className="hover:text-almond cursor-pointer"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-red-400 hover:underline cursor-pointer"
            >
              {isMod && !isAuthor ? "Mod Remove" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-xs">
          {error}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-2 mb-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond focus:outline-none focus:border-almond"
          />
          <textarea
            rows="3"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Text (optional)"
            className="w-full px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond focus:outline-none focus:border-almond"
          />
          <input
            type="url"
            value={editImage}
            onChange={(e) => {
              setEditImage(e.target.value);
              setEditImageFile(null);
            }}
            placeholder="Image URL (optional)"
            className="w-full px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond focus:outline-none focus:border-almond"
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
            className="block text-xs text-almond-muted file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-velvet file:text-almond file:cursor-pointer"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1 rounded-full border border-obsidian-border text-xs text-almond-muted hover:text-almond"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-xs font-semibold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Title & Content */}
          <Link to={`/post/${post.id}`} className="block">
            <h2 className="text-lg font-semibold text-almond mb-2 hover:underline">
              {post.title}
            </h2>
          </Link>
          {post.content && (
            <p className="text-sm text-almond/85 mb-3 line-clamp-3 whitespace-pre-line">
              {post.content}
            </p>
          )}

          {/* Optional Image */}
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full max-h-96 object-cover rounded-lg border border-obsidian-border mb-3"
            />
          )}
        </>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-3 pt-1">
        {isLoggedIn ? (
          <>
            {/* Voting Pill */}
            <div className="flex items-center bg-obsidian border border-obsidian-border rounded-full px-2 py-1 gap-2 text-sm">
              <button
                type="button"
                disabled={voting}
                onClick={() => handleVote(1)}
                className={`cursor-pointer transition ${
                  post.userVote === 1
                    ? "text-almond font-bold"
                    : "text-almond-muted hover:text-almond"
                }`}
                aria-label="Upvote"
              >
                ▲
              </button>
              <span className="font-semibold text-almond min-w-[1.25rem] text-center">
                {post.score ?? 0}
              </span>
              <button
                type="button"
                disabled={voting}
                onClick={() => handleVote(-1)}
                className={`cursor-pointer transition ${
                  post.userVote === -1
                    ? "text-red-400 font-bold"
                    : "text-almond-muted hover:text-almond"
                }`}
                aria-label="Downvote"
              >
                ▼
              </button>
            </div>

            {/* Comments Button */}
            <Link
              to={`/post/${post.id}`}
              className="px-3 py-1 rounded-full bg-obsidian border border-obsidian-border hover:bg-velvet/40 text-xs text-almond"
            >
              💬 {post.commentCount ?? 0} Comments
            </Link>
          </>
        ) : (
          <span className="text-xs text-almond-muted italic">
            Log in to view scores, vote, or join the discussion.
          </span>
        )}
      </div>
    </article>
  );
}

export default function HomeFeedPage({ communityId = null }) {
  const { user, isLoggedIn } = useAuth();

  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setPage(1);

    const fetcher = communityId
      ? getCommunityPosts(communityId, { page: 1, limit: 10, sort })
      : getHomeFeed({ page: 1, limit: 10, sort });

    fetcher
      .then((res) => {
        if (cancelled) return;
        setPosts(res.data.posts || []);
        setHasMore(Boolean(res.data.pagination?.hasMore));
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
  }, [communityId, sort, isLoggedIn]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    setError("");
    try {
      const res = communityId
        ? await getCommunityPosts(communityId, {
            page: nextPage,
            limit: 10,
            sort,
          })
        : await getHomeFeed({ page: nextPage, limit: 10, sort });

      setPosts((prev) => [...prev, ...(res.data.posts || [])]);
      setPage(nextPage);
      setHasMore(Boolean(res.data.pagination?.hasMore));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handleDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <div className="space-y-4">
      {/* Sort Bar */}
      <div className="flex items-center gap-2 pb-2 border-b border-obsidian-border">
        <button
          onClick={() => setSort("new")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
            sort === "new"
              ? "bg-velvet text-almond"
              : "hover:bg-obsidian-light text-almond-muted"
          }`}
        >
          New
        </button>
        <button
          onClick={() => setSort("top")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
            sort === "top"
              ? "bg-velvet text-almond"
              : "hover:bg-obsidian-light text-almond-muted"
          }`}
        >
          Top
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Feed List */}
      {loading ? (
        <div className="p-8 text-center text-sm text-almond-muted">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-obsidian-light border border-obsidian-border text-sm text-almond-muted space-y-2">
          <p>No posts to show yet.</p>
          {isLoggedIn && (
            <p className="text-xs">
              Join or create a community, then{" "}
              <Link to="/submit" className="text-almond hover:underline">
                create a post
              </Link>
              !
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const authorId =
              typeof post.author === "object" ? post.author?.id : post.author;
            const communityCreator =
              typeof post.community === "object"
                ? post.community?.creator
                : null;
            return (
              <PostCard
                key={post.id}
                post={post}
                isLoggedIn={isLoggedIn}
                isAuthor={Boolean(user && String(user.id) === String(authorId))}
                isMod={Boolean(
                  user &&
                    communityCreator &&
                    String(user.id) === String(communityCreator)
                )}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            );
          })}
        </div>
      )}

      {/* Load More Pagination */}
      {hasMore && (
        <div className="pt-4 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 rounded-full bg-velvet hover:bg-velvet-hover text-almond text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {loadingMore ? "Loading..." : "Load More Posts"}
          </button>
        </div>
      )}
    </div>
  );
}
