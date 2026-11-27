// src/components/Layout.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createCommunity, getCommunities } from "../services/api";

export default function Layout({ children }) {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const loadCommunities = () => {
    getCommunities()
      .then((res) => setCommunities(res.data.communities || []))
      .catch(() => setCommunities([]));
  };

  useEffect(() => {
    loadCommunities();
  }, [isLoggedIn]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await createCommunity({
        name: newName,
        description: newDescription,
      });
      const created = res.data.community;
      setCommunities((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName("");
      setNewDescription("");
      setShowCreateModal(false);
      navigate(`/r/${created.name}`);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isHome = location.pathname === "/";
  const isSearch = location.pathname === "/search";

  return (
    <div className="min-h-screen bg-obsidian text-almond font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-obsidian border-b border-obsidian-border">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl tracking-wide text-almond"
        >
          <span className="w-8 h-8 rounded-full bg-velvet flex items-center justify-center text-sm">
            H
          </span>
          HIVE
        </Link>

        {/* Search Bar (Communities & Users) */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities or users..."
            className="w-full px-4 py-1.5 rounded-full bg-obsidian-light border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                to="/submit"
                className="px-4 py-1.5 rounded-full bg-velvet hover:bg-velvet-hover text-almond text-sm font-medium transition"
              >
                + Create Post
              </Link>
              <Link
                to={`/u/${user.username}`}
                title={`u/${user.username}`}
                className="w-8 h-8 rounded-full bg-almond text-obsidian font-bold flex items-center justify-center text-sm overflow-hidden"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.username?.[0]?.toUpperCase() || "U"
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-full border border-obsidian-border text-almond-muted hover:text-almond hover:border-almond text-xs font-medium transition"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full border border-almond text-almond hover:bg-velvet/40 text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-sm font-semibold"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main 3-Column Body */}
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <aside className="hidden md:block w-60 shrink-0 border-r border-obsidian-border min-h-[calc(100vh-3.5rem)] p-3 space-y-6">
          <nav className="space-y-1 text-sm">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-lg font-medium ${
                isHome
                  ? "bg-velvet/60 text-almond"
                  : "hover:bg-obsidian-light text-almond-muted hover:text-almond"
              }`}
            >
              Home Feed
            </Link>
            <Link
              to="/search"
              className={`block px-3 py-2 rounded-lg font-medium ${
                isSearch
                  ? "bg-velvet/60 text-almond"
                  : "hover:bg-obsidian-light text-almond-muted hover:text-almond"
              }`}
            >
              Explore
            </Link>
          </nav>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs uppercase tracking-wider text-almond-muted">
                Communities
              </span>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setCreateError("");
                    setShowCreateModal(true);
                  }}
                  className="text-xs text-almond hover:underline cursor-pointer"
                >
                  + Create
                </button>
              )}
            </div>
            {communities.length === 0 ? (
              <p className="px-3 text-xs text-almond-muted">
                No communities yet.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {communities.map((c) => {
                  const active = location.pathname === `/r/${c.name}`;
                  return (
                    <li key={c.id}>
                      <Link
                        to={`/r/${c.name}`}
                        className={`block px-3 py-1.5 rounded-lg truncate ${
                          active
                            ? "bg-velvet/60 text-almond font-medium"
                            : "hover:bg-obsidian-light text-almond-muted hover:text-almond"
                        }`}
                      >
                        h/{c.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Main Content Slot */}
        <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-obsidian-light border border-obsidian-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-almond mb-1">
              Create a Community
            </h2>
            <p className="text-xs text-almond-muted mb-4">
              Choose a unique name (3–30 characters).
            </p>

            {createError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateCommunity} className="space-y-3">
              <input
                type="text"
                placeholder="Community name (e.g. webdev)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                minLength={3}
                maxLength={30}
                className="w-full px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
              />
              <textarea
                rows="3"
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                maxLength={500}
                className="w-full px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-1.5 rounded-full border border-obsidian-border text-almond-muted hover:text-almond text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-xs font-semibold disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
