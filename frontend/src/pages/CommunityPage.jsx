// src/pages/CommunityPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCommunityByName,
  joinCommunity,
  leaveCommunity,
} from "../services/api";
import HomeFeedPage from "./HomeFeedPage";

export function CommunityHeader({
  community,
  isJoined,
  isMod,
  isLoggedIn,
  onToggleJoin,
  toggling,
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-obsidian-border bg-obsidian-light mb-6">
      {/* Velvet Banner */}
      <div className="h-24 bg-gradient-to-r from-velvet to-obsidian" />

      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-almond">
              h/{community.name}
            </h1>
            {isMod && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-velvet text-almond border border-almond/30">
                Moderator
              </span>
            )}
          </div>
          {community.description && (
            <p className="text-sm text-almond-muted mt-1">
              {community.description}
            </p>
          )}
          <p className="text-xs text-almond-muted mt-2">
            {community.memberCount ?? 0}{" "}
            {community.memberCount === 1 ? "member" : "members"}
          </p>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleJoin}
              disabled={toggling}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer disabled:opacity-50 ${
                isJoined
                  ? "border border-almond text-almond hover:bg-velvet/40"
                  : "bg-almond text-obsidian hover:bg-almond-dark"
              }`}
            >
              {toggling ? "..." : isJoined ? "Joined" : "Join"}
            </button>
            <Link
              to={`/submit?community=${community.id}`}
              className="px-4 py-1.5 rounded-full bg-velvet hover:bg-velvet-hover text-almond text-sm font-medium"
            >
              + Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { communityName } = useParams();
  const { user, isLoggedIn } = useAuth();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getCommunityByName(communityName)
      .then((res) => {
        if (!cancelled) setCommunity(res.data.community);
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
  }, [communityName, isLoggedIn]);

  const handleToggleJoin = async () => {
    if (!community) return;
    setToggling(true);
    setError("");
    try {
      const res = community.isJoined
        ? await leaveCommunity(community.id)
        : await joinCommunity(community.id);
      setCommunity(res.data.community);
    } catch (err) {
      setError(err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-almond-muted">
        Loading community...
      </div>
    );
  }

  if (!community) {
    return (
      <div className="p-8 text-center rounded-xl bg-obsidian-light border border-obsidian-border text-sm text-red-400">
        {error || "Community not found."}
      </div>
    );
  }

  const isMod = Boolean(user && String(user.id) === String(community.creator));

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
          {error}
        </div>
      )}
      <CommunityHeader
        community={community}
        isJoined={Boolean(community.isJoined)}
        isMod={isMod}
        isLoggedIn={isLoggedIn}
        onToggleJoin={handleToggleJoin}
        toggling={toggling}
      />
      <HomeFeedPage communityId={community.id} />
    </div>
  );
}
