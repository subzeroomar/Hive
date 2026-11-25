// src/pages/HomeFeedPage.jsx
export function PostCard({ post, isLoggedIn, isAuthor, isMod }) {
  return (
    <article className="bg-obsidian-light border border-obsidian-border hover:border-velvet rounded-xl p-4 transition">
      {/* Post Header */}
      <div className="flex items-center justify-between text-xs text-almond-muted mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-almond hover:underline cursor-pointer">h/{post.community}</span>
          <span>•</span>
          <span>Posted by u/{post.author}</span>
          <span>•</span>
          <span>{post.createdAt}</span>
        </div>

        {/* Author / Mod Controls */}
        {isLoggedIn && (isAuthor || isMod) && (
          <div className="flex gap-2">
            {isAuthor && <button className="hover:text-almond">Edit</button>}
            <button className="text-red-400 hover:underline">
              {isMod && !isAuthor ? "Mod Remove" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Title & Content */}
      <h2 className="text-lg font-semibold text-almond mb-2 cursor-pointer hover:underline">
        {post.title}
      </h2>
      <p className="text-sm text-almond/85 mb-3 line-clamp-3">{post.content}</p>

      {/* Optional Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full max-h-96 object-cover rounded-lg border border-obsidian-border mb-3"
        />
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-3 pt-1">
        {isLoggedIn ? (
          <>
            {/* Voting Pill */}
            <div className="flex items-center bg-obsidian border border-obsidian-border rounded-full px-2 py-1 gap-2 text-sm">
              <button className="hover:text-almond text-almond-muted">▲</button>
              <span className="font-semibold text-almond">{post.score}</span>
              <button className="hover:text-almond text-almond-muted">▼</button>
            </div>

            {/* Comments Button */}
            <button className="px-3 py-1 rounded-full bg-obsidian border border-obsidian-border hover:bg-velvet/40 text-xs text-almond">
              💬 {post.commentCount} Comments
            </button>
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

export default function HomeFeedPage({ posts, isLoggedIn }) {
  return (
    <div className="space-y-4">
      {/* Sort Bar */}
      <div className="flex items-center gap-2 pb-2 border-b border-obsidian-border">
        <button className="px-4 py-1.5 rounded-full bg-velvet text-almond text-sm font-medium">
          New
        </button>
        <button className="px-4 py-1.5 rounded-full hover:bg-obsidian-light text-almond-muted text-sm font-medium">
          Top
        </button>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />
        ))}
      </div>

      {/* Load More Pagination */}
      <div className="pt-4 text-center">
        <button className="px-6 py-2 rounded-full bg-velvet hover:bg-velvet-hover text-almond text-sm font-medium">
          Load More Posts
        </button>
      </div>
    </div>
  );
}