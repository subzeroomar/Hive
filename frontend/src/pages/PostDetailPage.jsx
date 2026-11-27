// src/pages/PostDetailPage.jsx
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createComment,
  deleteComment,
  deletePost,
  getPostById,
  getPostComments,
  summarizePost,
  updateComment,
  updatePost,
  voteOnPost,
} from "../services/api";
import { formatTime } from "../utils/formatTime";

function CommentItem({
  comment,
  postId,
  isMod,
  currentUserId,
  onChanged,
  depth = 0,
}) {
  const authorId =
    typeof comment.author === "object" ? comment.author?.id : comment.author;
  const authorName =
    typeof comment.author === "object"
      ? comment.author?.username
      : comment.author;
  const isAuthor = Boolean(
    currentUserId && String(authorId) === String(currentUserId)
  );

  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setBusy(true);
    setError("");
    try {
      await createComment(postId, {
        content: replyText.trim(),
        parentComment: comment.id,
      });
      setReplyText("");
      setReplying(false);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setBusy(true);
    setError("");
    try {
      await updateComment(comment.id, { content: editText.trim() });
      setEditing(false);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    const label =
      isMod && !isAuthor
        ? "remove this comment as moderator"
        : "delete this comment (and its replies)";
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;
    setBusy(true);
    setError("");
    try {
      await deleteComment(comment.id);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`mt-4 ${
        depth > 0 ? "ml-5 pl-4 border-l-2 border-velvet/60" : ""
      }`}
    >
      <div className="text-xs text-almond-muted mb-1 flex items-center gap-2">
        {authorName ? (
          <Link
            to={`/u/${authorName}`}
            className="font-semibold text-almond hover:underline"
          >
            u/{authorName}
          </Link>
        ) : (
          <span className="font-semibold text-almond">u/unknown</span>
        )}
        <span>•</span>
        <span>{formatTime(comment.createdAt)}</span>
      </div>

      {error && (
        <div className="mb-2 text-xs text-red-400">{error}</div>
      )}

      {editing ? (
        <form onSubmit={handleEdit} className="space-y-2 mb-2">
          <textarea
            rows="2"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            required
            className="w-full p-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond focus:outline-none focus:border-almond"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="px-3 py-1 rounded-full bg-almond text-obsidian text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditText(comment.content);
              }}
              className="px-3 py-1 rounded-full border border-obsidian-border text-xs text-almond-muted hover:text-almond cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-almond/90 mb-2 whitespace-pre-line">
          {comment.content}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-almond-muted">
        <button
          type="button"
          onClick={() => setReplying((v) => !v)}
          className="hover:text-almond font-medium cursor-pointer"
        >
          Reply
        </button>
        {isAuthor && (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="hover:text-almond cursor-pointer"
          >
            Edit
          </button>
        )}
        {(isAuthor || isMod) && (
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="text-red-400 hover:underline cursor-pointer disabled:opacity-50"
          >
            {isMod && !isAuthor ? "Remove" : "Delete"}
          </button>
        )}
      </div>

      {replying && (
        <form onSubmit={handleReply} className="mt-2 space-y-2">
          <textarea
            rows="2"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to u/${authorName || "comment"}...`}
            required
            className="w-full p-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="px-3 py-1 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {busy ? "Posting..." : "Reply"}
            </button>
            <button
              type="button"
              onClick={() => {
                setReplying(false);
                setReplyText("");
              }}
              className="px-3 py-1 rounded-full border border-obsidian-border text-xs text-almond-muted hover:text-almond cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Recursive Replies */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          isMod={isMod}
          currentUserId={currentUserId}
          onChanged={onChanged}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  const [aiSummary, setAiSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadComments = useCallback(async () => {
    if (!isLoggedIn) {
      setComments([]);
      return;
    }
    const res = await getPostComments(postId);
    setComments(res.data.comments || []);
    setPost((prev) =>
      prev ? { ...prev, commentCount: res.data.totalComments } : prev
    );
  }, [postId, isLoggedIn]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setAiSummary("");

    const tasks = [getPostById(postId)];
    if (isLoggedIn) tasks.push(getPostComments(postId));

    Promise.all(tasks)
      .then(([postRes, commentsRes]) => {
        if (cancelled) return;
        const loaded = postRes.data.post;
        setPost(loaded);
        setEditTitle(loaded.title);
        setEditContent(loaded.content || "");
        setEditImage(loaded.image || "");
        if (commentsRes) {
          setComments(commentsRes.data.comments || []);
        } else {
          setComments([]);
        }
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
  }, [postId, isLoggedIn]);

  const handleVote = async (value) => {
    if (!isLoggedIn || voting || !post) return;
    setVoting(true);
    setError("");
    try {
      const res = await voteOnPost(post.id, value);
      setPost((prev) => ({
        ...prev,
        upvotes: res.data.upvotes,
        downvotes: res.data.downvotes,
        score: res.data.score,
        userVote: res.data.userVote,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  const handleSummarize = async () => {
    if (!isLoggedIn || summarizing || !post) return;
    setSummarizing(true);
    setError("");
    try {
      const res = await summarizePost(post.id);
      setAiSummary(res.data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setSummarizing(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommenting(true);
    setError("");
    try {
      await createComment(postId, { content: newComment.trim() });
      setNewComment("");
      await loadComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setCommenting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await updatePost(post.id, {
        title: editTitle,
        content: editContent,
        image: editImage,
        imageFile: editImageFile,
      });
      setPost(res.data.post);
      setEditImageFile(null);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (isModRemove) => {
    const label = isModRemove
      ? "remove this post as moderator"
      : "delete this post";
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;
    try {
      await deletePost(post.id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-almond-muted">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center rounded-xl bg-obsidian-light border border-obsidian-border text-sm text-red-400">
        {error || "Post not found."}
      </div>
    );
  }

  const communityName =
    typeof post.community === "object" ? post.community?.name : post.community;
  const communityCreator =
    typeof post.community === "object" ? post.community?.creator : null;
  const authorName =
    typeof post.author === "object" ? post.author?.username : post.author;
  const authorId =
    typeof post.author === "object" ? post.author?.id : post.author;
  const isAuthor = Boolean(user && String(user.id) === String(authorId));
  const isMod = Boolean(
    user && communityCreator && String(user.id) === String(communityCreator)
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Full Post */}
      <div className="bg-obsidian-light border border-obsidian-border rounded-xl p-5">
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

          {isLoggedIn && (isAuthor || isMod) && (
            <div className="flex gap-3">
              {isAuthor && (
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="hover:text-almond cursor-pointer"
                >
                  {editing ? "Cancel" : "Edit"}
                </button>
              )}
              <button
                onClick={() => handleDelete(isMod && !isAuthor)}
                className="text-red-400 hover:underline cursor-pointer"
              >
                {isMod && !isAuthor ? "Mod Remove" : "Delete"}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-3 mt-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond focus:outline-none focus:border-almond"
            />
            <textarea
              rows="5"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
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
                className="px-4 py-1.5 rounded-full border border-obsidian-border text-xs text-almond-muted hover:text-almond"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-1.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-xs font-semibold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-almond mb-3">
              {post.title}
            </h1>
            {post.content && (
              <p className="text-sm text-almond/90 leading-relaxed mb-4 whitespace-pre-line">
                {post.content}
              </p>
            )}
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full max-h-[500px] object-cover rounded-lg border border-obsidian-border mb-4"
              />
            )}
          </>
        )}

        {/* Voting + AI Summarize Feature (Logged-in only) */}
        {isLoggedIn ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center bg-obsidian border border-obsidian-border rounded-full px-3 py-1 gap-2 text-sm">
                <button
                  type="button"
                  disabled={voting}
                  onClick={() => handleVote(1)}
                  className={`cursor-pointer transition ${
                    post.userVote === 1
                      ? "text-almond font-bold"
                      : "text-almond-muted hover:text-almond"
                  }`}
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
                >
                  ▼
                </button>
              </div>

              <button
                type="button"
                disabled={summarizing}
                onClick={handleSummarize}
                className="px-4 py-1.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-xs font-semibold cursor-pointer disabled:opacity-50 transition"
              >
                {summarizing ? "Summarizing..." : "✨ Summarize with AI"}
              </button>
            </div>

            {aiSummary && (
              <div className="p-4 rounded-lg bg-velvet-muted border border-velvet text-sm text-almond">
                <div className="text-xs uppercase tracking-wider text-almond-muted mb-1 font-semibold">
                  AI Summary
                </div>
                {aiSummary}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-almond-muted italic mt-2">
            Log in to view scores, vote, summarize, or join the discussion.
          </p>
        )}
      </div>

      {/* Comments Section (Restricted to Logged-in Users) */}
      {isLoggedIn ? (
        <div className="bg-obsidian-light border border-obsidian-border rounded-xl p-5">
          <form onSubmit={handleAddComment}>
            <textarea
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              required
              className="w-full p-3 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={commenting}
                className="px-4 py-1.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {commenting ? "Posting..." : "Comment"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            {comments.length === 0 ? (
              <p className="text-sm text-almond-muted text-center py-4">
                No comments yet. Start the discussion!
              </p>
            ) : (
              comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  postId={postId}
                  isMod={isMod}
                  currentUserId={user?.id}
                  onChanged={loadComments}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center rounded-xl bg-obsidian-light border border-obsidian-border text-sm text-almond-muted">
          Please{" "}
          <Link to="/login" className="text-almond hover:underline">
            log in
          </Link>{" "}
          to view comments and join the discussion.
        </div>
      )}
    </div>
  );
}
