// src/pages/PostDetailPage.jsx
function CommentItem({ comment, isMod, currentUserId, depth = 0 }) {
  const isAuthor = comment.authorId === currentUserId;

  return (
    <div className={`mt-3 ${depth > 0 ? "ml-5 pl-4 border-l-2 border-velvet/60" : ""}`}>
      <div className="text-xs text-almond-muted mb-1 flex items-center gap-2">
        <span className="font-semibold text-almond">u/{comment.author}</span>
        <span>•</span>
        <span>{comment.createdAt}</span>
      </div>
      <p className="text-sm text-almond/90 mb-2">{comment.content}</p>

      <div className="flex items-center gap-3 text-xs text-almond-muted">
        <button className="hover:text-almond font-medium">Reply</button>
        {isAuthor && <button className="hover:text-almond">Edit</button>}
        {(isAuthor || isMod) && (
          <button className="text-red-400 hover:underline">
            {isMod && !isAuthor ? "Remove" : "Delete"}
          </button>
        )}
      </div>

      {/* Recursive Replies */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          isMod={isMod}
          currentUserId={currentUserId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function PostDetailPage({ post, comments, aiSummary, isLoggedIn, isMod }) {
  return (
    <div className="space-y-6">
      {/* Full Post */}
      <div className="bg-obsidian-light border border-obsidian-border rounded-xl p-5">
        <div className="text-xs text-almond-muted mb-2">
          h/{post.community} • Posted by u/{post.author}
        </div>
        <h1 className="text-2xl font-bold text-almond mb-3">{post.title}</h1>
        <p className="text-sm text-almond/90 leading-relaxed mb-4">{post.content}</p>

        {/* AI Summarize Feature (Logged-in only) */}
        {isLoggedIn && (
          <div className="mt-4">
            <button className="px-4 py-1.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-xs font-semibold">
              ✨ Summarize with AI
            </button>

            {aiSummary && (
              <div className="mt-3 p-4 rounded-lg bg-velvet-muted border border-velvet text-sm text-almond">
                <div className="text-xs uppercase tracking-wider text-almond-muted mb-1 font-semibold">
                  AI Summary
                </div>
                {aiSummary}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comments Section (Restricted to Logged-in Users) */}
      {isLoggedIn ? (
        <div className="bg-obsidian-light border border-obsidian-border rounded-xl p-5">
          <textarea
            rows="3"
            placeholder="Add a comment..."
            className="w-full p-3 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
          />
          <div className="flex justify-end mt-2">
            <button className="px-4 py-1.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-xs font-semibold">
              Comment
            </button>
          </div>

          <div className="mt-6">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} isMod={isMod} />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center rounded-xl bg-obsidian-light border border-obsidian-border text-sm text-almond-muted">
          Please log in to view comments and join the discussion.
        </div>
      )}
    </div>
  );
}