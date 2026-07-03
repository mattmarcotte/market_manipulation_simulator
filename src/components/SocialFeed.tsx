"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SocialPost {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: number;
  isPresident: boolean;
  likes: number;
  reposts: number;
}

interface MarketAdjustment {
  symbol: string;
  impactPercent: number;
  reason: string;
  postId: string;
  timestamp: number;
}

export default function SocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [adjustments, setAdjustments] = useState<MarketAdjustment[]>([]);
  const [toasts, setToasts] = useState<MarketAdjustment[]>([]);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  const [noImpact, setNoImpact] = useState<Set<string>>(new Set());
  const toastTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const analyzeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Resolve a post's "analyzing" state — clears the spinner and, if no
  // adjustment ever arrived, marks it as analyzed-with-no-impact.
  const resolveAnalyzing = useCallback((postId: string, hadImpact: boolean) => {
    const timer = analyzeTimers.current.get(postId);
    if (timer) {
      clearTimeout(timer);
      analyzeTimers.current.delete(postId);
    }
    setAnalyzing((prev) => {
      if (!prev.has(postId)) return prev;
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
    if (!hadImpact) {
      setNoImpact((prev) => new Set(prev).add(postId));
    }
  }, []);

  // Initial fetch
  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/social/feed");
      const data = await res.json();
      setPosts(data.posts);
      setAdjustments(data.adjustments);
    } catch {}
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // SSE stream for real-time updates
  useEffect(() => {
    const es = new EventSource("/api/social/stream");

    es.addEventListener("post", (e) => {
      const post: SocialPost = JSON.parse(e.data);
      setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)].slice(0, 50));
      if (post.isPresident) {
        setNoImpact((prev) => {
          if (!prev.has(post.id)) return prev;
          const next = new Set(prev);
          next.delete(post.id);
          return next;
        });
        setAnalyzing((prev) => new Set(prev).add(post.id));
        // Fallback: if no adjustment arrives (no market impact, or a dropped
        // event), resolve the spinner instead of hanging forever.
        const timer = setTimeout(() => resolveAnalyzing(post.id, false), 15000);
        analyzeTimers.current.set(post.id, timer);
      }
    });

    es.addEventListener("adjustment", (e) => {
      const adj: MarketAdjustment = JSON.parse(e.data);
      setAdjustments((prev) => [adj, ...prev].slice(0, 50));
      resolveAnalyzing(adj.postId, true);

      // Show toast
      const toastKey = `${adj.symbol}-${adj.timestamp}`;
      setToasts((prev) => [adj, ...prev].slice(0, 5));
      const timeout = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => !(t.symbol === adj.symbol && t.timestamp === adj.timestamp)));
      }, 6000);
      toastTimeouts.current.set(toastKey, timeout);
    });

    const timers = analyzeTimers.current;
    return () => {
      es.close();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, [resolveAnalyzing]);

  async function handlePost() {
    if (!draft.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      if (res.ok) {
        setDraft("");
        setCharCount(0);
      }
    } catch {}
    setPosting(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handlePost();
    }
  }

  function getAdjustmentsForPost(postId: string) {
    return adjustments.filter((a) => a.postId === postId);
  }

  function formatTime(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden flex flex-col">
      {/* Impact toasts */}
      {toasts.length > 0 && (
        <div className="px-3 py-2 space-y-1 bg-gray-800/80 border-b border-gray-700">
          <div className="text-[9px] text-gray-500 uppercase font-bold">Market Impact</div>
          {toasts.map((adj, i) => (
            <div
              key={`${adj.symbol}-${adj.timestamp}-${i}`}
              className={`text-xs font-mono px-2 py-1.5 rounded flex items-center justify-between animate-pulse ${
                adj.impactPercent >= 0
                  ? "bg-green-900/50 text-green-400"
                  : "bg-red-900/50 text-red-400"
              }`}
            >
              <span className="font-bold">{adj.symbol}</span>
              <span>{adj.impactPercent > 0 ? "+" : ""}{adj.impactPercent.toFixed(1)}%</span>
              <span className="text-gray-400 text-[10px] truncate ml-2 max-w-[150px]">{adj.reason}</span>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-white">Chirper</h2>
        <p className="text-[10px] text-gray-500">Presidential Social Media</p>
      </div>

      {/* Compose */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
            P
          </div>
          <div className="flex-1">
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setCharCount(e.target.value.length);
              }}
              onKeyDown={handleKeyDown}
              placeholder="What's happening, Mr. President?"
              className="w-full bg-transparent text-white text-sm resize-none outline-none placeholder-gray-600 min-h-[60px]"
              maxLength={280}
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-[10px] font-mono ${charCount > 260 ? "text-red-400" : "text-gray-600"}`}>
                {charCount}/280
              </span>
              <button
                onClick={handlePost}
                disabled={!draft.trim() || posting}
                className="bg-blue-500 hover:bg-blue-400 disabled:bg-blue-900 disabled:text-gray-500 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
              >
                {posting ? "Posting..." : "Chirp"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto max-h-[600px]">
        {posts.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">
            No chirps yet. Say something presidential.
          </div>
        ) : (
          posts.map((post) => {
            const postAdjustments = getAdjustmentsForPost(post.id);
            const isAnalyzing = analyzing.has(post.id);
            const showNoImpact = noImpact.has(post.id) && postAdjustments.length === 0;
            return (
              <div
                key={post.id}
                className="px-4 py-3 border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      post.isPresident ? "bg-blue-600" : "bg-gray-600"
                    }`}
                  >
                    {post.author[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-white">{post.author}</span>
                      {post.isPresident && (
                        <span className="text-[9px] bg-blue-600 text-white px-1 rounded">POTUS</span>
                      )}
                      <span className="text-xs text-gray-500">{post.handle}</span>
                      <span className="text-xs text-gray-600">· {formatTime(post.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-200 mt-1 whitespace-pre-wrap break-words">
                      {post.content}
                    </p>

                    {/* Analyzing indicator */}
                    {isAnalyzing && postAdjustments.length === 0 && (
                      <div className="mt-2 text-[10px] text-yellow-500 font-mono flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        Markets analyzing...
                      </div>
                    )}

                    {/* Analyzed — no significant market impact */}
                    {showNoImpact && (
                      <div className="mt-2 text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 bg-gray-600 rounded-full" />
                        No significant market impact
                      </div>
                    )}

                    {/* Market impact indicators */}
                    {postAdjustments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {postAdjustments.map((adj, i) => (
                          <div
                            key={i}
                            className={`text-[10px] font-mono px-2 py-1 rounded inline-flex items-center gap-1 ${
                              adj.impactPercent >= 0
                                ? "bg-green-900/40 text-green-400"
                                : "bg-red-900/40 text-red-400"
                            }`}
                          >
                            <span className="font-bold">{adj.symbol}</span>
                            <span>
                              {adj.impactPercent > 0 ? "+" : ""}
                              {adj.impactPercent.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
