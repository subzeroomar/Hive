// src/pages/AuthPage.jsx
export function AuthPage({ mode = "login" }) {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-obsidian-light border border-obsidian-border rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-almond mb-1">
          {mode === "login" ? "Log in to HIVE" : "Create your HIVE account"}
        </h1>
        <p className="text-sm text-almond-muted mb-6">
          Join communities, vote, and discuss.
        </p>

        <form className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
          />
          <button className="w-full py-2.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark font-semibold text-sm transition">
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}