// src/pages/SearchPage.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getCommunities,
  searchCommunities,
  searchUsers,
} from "../services/api";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [input, setInput] = useState(initialQuery);
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setInput(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const trimmed = initialQuery.trim();

    if (!trimmed) {
      // Explore mode: list all communities
      getCommunities()
        .then((res) => {
          if (cancelled) return;
          setCommunities(res.data.communities || []);
          setUsers([]);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      Promise.all([searchCommunities(trimmed), searchUsers(trimmed)])
        .then(([commRes, userRes]) => {
          if (cancelled) return;
          setCommunities(commRes.data.communities || []);
          setUsers(userRes.data.users || []);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search communities or users..."
          className="flex-1 px-4 py-2 rounded-full bg-obsidian-light border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-full bg-velvet hover:bg-velvet-hover text-almond text-sm font-medium cursor-pointer"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-almond-muted">
          Searching...
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-almond-muted font-semibold">
              {initialQuery.trim() ? "Communities" : "Explore Communities"}
            </h2>
            {communities.length === 0 ? (
              <p className="text-sm text-almond-muted">No communities found.</p>
            ) : (
              <div className="space-y-2">
                {communities.map((c) => (
                  <Link
                    key={c.id}
                    to={`/r/${c.name}`}
                    className="block p-4 rounded-xl bg-obsidian-light border border-obsidian-border hover:border-velvet transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-almond">
                        h/{c.name}
                      </span>
                      <span className="text-xs text-almond-muted">
                        {c.memberCount ?? 0}{" "}
                        {c.memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-almond-muted mt-1">
                        {c.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {initialQuery.trim() && (
            <section className="space-y-3">
              <h2 className="text-sm uppercase tracking-wider text-almond-muted font-semibold">
                Users
              </h2>
              {users.length === 0 ? (
                <p className="text-sm text-almond-muted">No users found.</p>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <Link
                      key={u.id}
                      to={`/u/${u.username}`}
                      className="flex items-center gap-3 p-4 rounded-xl bg-obsidian-light border border-obsidian-border hover:border-velvet transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-velvet text-almond font-bold flex items-center justify-center text-sm overflow-hidden shrink-0">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          u.username?.[0]?.toUpperCase() || "U"
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-almond text-sm">
                          u/{u.username}
                        </div>
                        {u.bio && (
                          <p className="text-xs text-almond-muted line-clamp-1">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
