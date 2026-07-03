export interface SocialPost {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: number;
  isPresident: boolean;
  likes: number;
  reposts: number;
}

const MAX_POSTS = 200;

type Listener = (post: SocialPost) => void;

// Shared across route bundles / HMR reloads via globalThis — the post API
// route and the SSE stream route must see the same posts and listener set.
const globalStore = globalThis as unknown as {
  __socialPosts?: SocialPost[];
  __socialListeners?: Set<Listener>;
};
const posts = (globalStore.__socialPosts ??= []);
const listeners = (globalStore.__socialListeners ??= new Set<Listener>());

export function addPost(post: SocialPost) {
  posts.unshift(post);
  if (posts.length > MAX_POSTS) posts.pop();
  for (const listener of listeners) {
    listener(post);
  }
}

export function getFeed(limit = 50): SocialPost[] {
  return posts.slice(0, limit);
}

export function onNewPost(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
