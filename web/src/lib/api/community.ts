import { apiRequest } from "@/lib/api/client";

export type CommunityApiPost = {
  _id: string;
  userId?: string;
  authorName: string;
  authorInitials?: string;
  content: string;
  tag?: string;
  likeCount?: number;
  likedByMe?: boolean;
  createdAt?: string;
  likes?: string[];
  comments?: Array<{
    _id?: string;
    name?: string;
    content?: string;
    createdAt?: string;
  }>;
};

export type CommunityPostsResponse = {
  success: boolean;
  posts: CommunityApiPost[];
};

export type CommunityPostResponse = {
  success: boolean;
  post: CommunityApiPost;
};

export type CommunityLikeResponse = {
  success: boolean;
  likeCount: number;
  likedByMe: boolean;
};

export const communityApi = {
  list: (token: string) =>
    apiRequest<CommunityPostsResponse>("/community", {
      method: "GET",
      token,
    }),

  create: (payload: { content: string; tag?: string }, token: string) =>
    apiRequest<CommunityPostResponse>("/community", {
      method: "POST",
      body: payload,
      token,
    }),

  toggleLike: (id: string, token: string) =>
    apiRequest<CommunityLikeResponse>(`/community/${id}/like`, {
      method: "PUT",
      token,
    }),

  remove: (id: string, token: string) =>
    apiRequest<{ success: boolean }>(`/community/${id}`, {
      method: "DELETE",
      token,
    }),
};
