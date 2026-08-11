import type { CommunityApiPost } from "@/lib/api/community";
import type { DiscussionPost } from "@/types/community";

/**
 * Maps backend community posts into the discussions UI model.
 */
export function mapCommunityApiPost(post: CommunityApiPost): DiscussionPost {
  const lines = post.content.split("\n").map((line) => line.trim()).filter(Boolean);
  const title = lines[0]?.slice(0, 120) || post.tag || "Community update";
  const body =
    lines.length > 1 ? lines.slice(1).join("\n") : post.content;

  return {
    id: post._id,
    communityId: "live-feed",
    author: post.authorName,
    title,
    body,
    tags: post.tag ? [post.tag] : ["General"],
    createdAt: post.createdAt ?? new Date().toISOString(),
    reactions: [
      {
        type: "like",
        count: post.likeCount ?? post.likes?.length ?? 0,
      },
    ],
    comments: (post.comments ?? []).map((comment, index) => ({
      id: comment._id ?? `${post._id}-c${index}`,
      author: comment.name ?? "Member",
      body: comment.content ?? "",
      createdAt: comment.createdAt ?? new Date().toISOString(),
      replies: [],
    })),
    aiSuggestions: [
      "Great progress — keep going!",
      "What resource helped you most?",
      "Happy to share a tip if useful.",
    ],
  };
}
