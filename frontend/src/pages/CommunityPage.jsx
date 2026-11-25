// src/pages/CommunityPage.jsx
export default function CommunityHeader({ community, isJoined, isMod, isLoggedIn }) {
  return (
    <div className="rounded-xl overflow-hidden border border-obsidian-border bg-obsidian-light mb-6">
      {/* Velvet Banner */}
      <div className="h-24 bg-gradient-to-r from-velvet to-obsidian" />

      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-almond">h/{community.name}</h1>
            {isMod && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-velvet text-almond border border-almond/30">
                Moderator
              </span>
            )}
          </div>
          <p className="text-sm text-almond-muted mt-1">{community.description}</p>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-2">
            <button
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition ${
                isJoined
                  ? "border border-almond text-almond hover:bg-velvet/40"
                  : "bg-almond text-obsidian hover:bg-almond-dark"
              }`}
            >
              {isJoined ? "Joined" : "Join"}
            </button>
            <button className="px-4 py-1.5 rounded-full bg-velvet hover:bg-velvet-hover text-almond text-sm font-medium">
              + Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}