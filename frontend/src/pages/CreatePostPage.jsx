// src/pages/CreatePostPage.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPost, getCommunities, joinCommunity } from "../services/api";

export function CreatePostPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [communities, setCommunities] = useState([]);
  const [communityId, setCommunityId] = useState(
    searchParams.get("community") || ""
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    getCommunities()
      .then((res) => setCommunities(res.data.communities || []))
      .catch((err) => setError(err.message));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const selectedCommunity = communities.find(
    (c) => String(c.id) === String(communityId)
  );

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, GIF, or WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file cannot exceed 5MB.");
      return;
    }
    setError("");
    setImageFile(file);
    setImageUrl("");
  };

  const handleClearFile = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleQuickJoin = async () => {
    if (!selectedCommunity) return;
    setJoining(true);
    setError("");
    try {
      const res = await joinCommunity(selectedCommunity.id);
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === selectedCommunity.id ? res.data.community : c
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!communityId) {
      setError("Please select a community.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPost({
        communityId,
        title,
        content,
        image: imageUrl.trim(),
        imageFile,
      });
      navigate(`/post/${res.data.post.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-obsidian-light border border-obsidian-border rounded-xl p-8 text-center space-y-3">
        <h1 className="text-xl font-bold text-almond">
          Log in to create a post
        </h1>
        <p className="text-sm text-almond-muted">
          You need an account to publish posts in communities.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2 rounded-full bg-almond text-obsidian hover:bg-almond-dark font-semibold text-sm"
        >
          Log In
        </Link>
      </div>
    );
  }

  const activePreview = previewUrl || imageUrl.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-obsidian-light border border-obsidian-border rounded-xl p-6 space-y-4"
    >
      <h1 className="text-xl font-bold text-almond">Create a Post</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
          required
          className="w-full sm:w-72 px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond focus:outline-none focus:border-almond"
        >
          <option value="">Choose a community</option>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              h/{c.name} {c.isJoined ? "(Joined)" : "(Not joined)"}
            </option>
          ))}
        </select>

        {selectedCommunity && !selectedCommunity.isJoined && (
          <button
            type="button"
            onClick={handleQuickJoin}
            disabled={joining}
            className="px-4 py-2 rounded-full bg-velvet hover:bg-velvet-hover text-almond text-xs font-medium cursor-pointer disabled:opacity-50"
          >
            {joining ? "Joining..." : `Join h/${selectedCommunity.name} to post`}
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={200}
        className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
      />

      <textarea
        rows="5"
        placeholder="Text (optional if you upload an image)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={10000}
        className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
      />

      {/* Image File Upload + Drag & Drop */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileChange(e.dataTransfer.files?.[0]);
          }}
          className="border-2 border-dashed border-obsidian-border rounded-lg p-6 text-center text-sm text-almond-muted hover:border-velvet cursor-pointer transition"
        >
          {imageFile ? (
            <div className="space-y-1">
              <p className="text-almond font-medium">{imageFile.name}</p>
              <p className="text-xs text-almond-muted">
                Click or drop another image to replace
              </p>
            </div>
          ) : (
            <p>
              Click or drag &amp; drop to upload an image (JPEG, PNG, GIF, WEBP
              — max 5MB)
            </p>
          )}
        </div>

        {/* Optional Image URL alternative */}
        {!imageFile && (
          <input
            type="url"
            placeholder="...or paste an image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-obsidian border border-obsidian-border text-xs text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
          />
        )}

        {activePreview && (
          <div className="relative inline-block">
            <img
              src={activePreview}
              alt="Preview"
              className="max-h-64 rounded-lg border border-obsidian-border object-cover"
            />
            <button
              type="button"
              onClick={() => {
                handleClearFile();
                setImageUrl("");
              }}
              className="mt-2 block text-xs text-red-400 hover:underline cursor-pointer"
            >
              Remove image
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 rounded-full bg-almond text-obsidian hover:bg-almond-dark font-semibold text-sm cursor-pointer disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish Post"}
        </button>
      </div>
    </form>
  );
}
