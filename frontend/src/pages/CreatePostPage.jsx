// src/pages/CreatePostPage.jsx
export function CreatePostPage({ communities }) {
  return (
    <div className="bg-obsidian-light border border-obsidian-border rounded-xl p-6 space-y-4">
      <h1 className="text-xl font-bold text-almond">Create a Post</h1>

      <select className="w-full sm:w-64 px-3 py-2 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond focus:outline-none focus:border-almond">
        <option>Choose a community</option>
        {communities.map((c) => (
          <option key={c.id} value={c.name}>h/{c.name}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Title"
        className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
      />

      <textarea
        rows="5"
        placeholder="Text (optional)"
        className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
      />

      {/* Image Upload */}
      <div className="border-2 border-dashed border-obsidian-border rounded-lg p-6 text-center text-sm text-almond-muted hover:border-velvet cursor-pointer">
        Click to upload an image (optional)
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 rounded-full bg-almond text-obsidian hover:bg-almond-dark font-semibold text-sm">
          Publish Post
        </button>
      </div>
    </div>
  );
}