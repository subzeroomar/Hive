const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "hive_token";

// --- Token Helpers ---
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// --- Core Fetch Helper ---
async function request(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body
      ? isFormData
        ? options.body
        : JSON.stringify(options.body)
      : undefined,
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.message || `Request failed (${res.status})`);
  }

  return payload; // { success, message?, data }
}

// --- Health ---
export const checkHealth = () => request("/health");

// --- Auth ---
export const registerUser = ({ username, email, password }) =>
  request("/auth/register", {
    method: "POST",
    body: { username, email, password },
  });

export const loginUser = ({ email, password }) =>
  request("/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const getCurrentUser = () => request("/auth/me");

// --- Users ---
export const getUserProfile = (username) =>
  request(`/users/${encodeURIComponent(username)}`);

export const updateMyProfile = ({ bio, avatar }) =>
  request("/users/me", {
    method: "PUT",
    body: { bio, avatar },
  });

export const searchUsers = (query) =>
  request(`/users/search?q=${encodeURIComponent(query)}`);

// --- Communities ---
export const getCommunities = () => request("/communities");

export const createCommunity = ({ name, description }) =>
  request("/communities", {
    method: "POST",
    body: { name, description },
  });

export const getCommunityByName = (name) =>
  request(`/communities/${encodeURIComponent(name)}`);

export const searchCommunities = (query) =>
  request(`/communities/search?q=${encodeURIComponent(query)}`);

export const joinCommunity = (communityId) =>
  request(`/communities/${communityId}/join`, { method: "POST" });

export const leaveCommunity = (communityId) =>
  request(`/communities/${communityId}/leave`, { method: "DELETE" });

// --- Posts ---
export const getHomeFeed = ({ page = 1, limit = 10, sort = "new" } = {}) =>
  request(`/posts/feed?page=${page}&limit=${limit}&sort=${sort}`);

export const getCommunityPosts = (
  communityId,
  { page = 1, limit = 10, sort = "new" } = {}
) =>
  request(
    `/posts/community/${communityId}?page=${page}&limit=${limit}&sort=${sort}`
  );

export const createPost = ({ title, content, image, imageFile, communityId }) => {
  if (imageFile) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content || "");
    formData.append("communityId", communityId);
    formData.append("image", imageFile);

    return request("/posts", {
      method: "POST",
      body: formData,
    });
  }

  return request("/posts", {
    method: "POST",
    body: { title, content, image, communityId },
  });
};

export const getPostById = (postId) => request(`/posts/${postId}`);

export const updatePost = (postId, { title, content, image, imageFile }) => {
  if (imageFile) {
    const formData = new FormData();
    if (title !== undefined) formData.append("title", title);
    if (content !== undefined) formData.append("content", content);
    formData.append("image", imageFile);

    return request(`/posts/${postId}`, {
      method: "PUT",
      body: formData,
    });
  }

  return request(`/posts/${postId}`, {
    method: "PUT",
    body: { title, content, image },
  });
};

export const deletePost = (postId) =>
  request(`/posts/${postId}`, { method: "DELETE" });

export const summarizePost = (postId) =>
  request(`/posts/${postId}/summarize`, { method: "POST" });

// --- Votes ---
export const voteOnPost = (postId, value) =>
  request(`/votes/${postId}`, {
    method: "POST",
    body: { value },
  });

// --- Comments ---
export const getPostComments = (postId) => request(`/comments/post/${postId}`);

export const createComment = (postId, { content, parentComment = null }) =>
  request(`/comments/post/${postId}`, {
    method: "POST",
    body: { content, parentComment },
  });

export const updateComment = (commentId, { content }) =>
  request(`/comments/${commentId}`, {
    method: "PUT",
    body: { content },
  });

export const deleteComment = (commentId) =>
  request(`/comments/${commentId}`, { method: "DELETE" });
