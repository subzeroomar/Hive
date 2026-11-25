// src/components/Layout.jsx
export default function Layout({ children, isLoggedIn }) {
  return (
    <div className="min-h-screen bg-obsidian text-almond font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-obsidian border-b border-obsidian-border">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl tracking-wide text-almond">
          <span className="w-8 h-8 rounded-full bg-velvet flex items-center justify-center text-sm">H</span>
          HIVE
        </div>

        {/* Search Bar (Communities & Users) */}
        <div className="flex-1 max-w-xl mx-4">
          <input
            type="text"
            placeholder="Search communities or users..."
            className="w-full px-4 py-1.5 rounded-full bg-obsidian-light border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button className="px-4 py-1.5 rounded-full bg-velvet hover:bg-velvet-hover text-almond text-sm font-medium transition">
                + Create Post
              </button>
              <div className="w-8 h-8 rounded-full bg-almond text-obsidian font-bold flex items-center justify-center text-sm cursor-pointer">
                U
              </div>
            </>
          ) : (
            <>
              <button className="px-4 py-1.5 rounded-full border border-almond text-almond hover:bg-velvet/40 text-sm font-medium">
                Log In
              </button>
              <button className="px-4 py-1.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark text-sm font-semibold">
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main 3-Column Body */}
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <aside className="hidden md:block w-60 shrink-0 border-r border-obsidian-border min-h-[calc(100vh-3.5rem)] p-3 space-y-6">
          <nav className="space-y-1 text-sm">
            <a href="/" className="block px-3 py-2 rounded-lg bg-velvet/60 text-almond font-medium">
              Home Feed
            </a>
            <a href="/search" className="block px-3 py-2 rounded-lg hover:bg-obsidian-light text-almond-muted hover:text-almond">
              Explore
            </a>
          </nav>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs uppercase tracking-wider text-almond-muted">Communities</span>
              {isLoggedIn && (
                <button className="text-xs text-almond hover:underline">+ Create</button>
              )}
            </div>
            <ul className="space-y-1 text-sm">
              <li className="px-3 py-1.5 rounded-lg hover:bg-obsidian-light cursor-pointer">h/webdev</li>
              <li className="px-3 py-1.5 rounded-lg hover:bg-obsidian-light cursor-pointer">h/design</li>
            </ul>
          </div>
        </aside>

        {/* Main Content Slot */}
        <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}