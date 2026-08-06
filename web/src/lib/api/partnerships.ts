import { apiRequest } from "@/lib/api/client";
import type {
  CreatePartnershipRequestPayload,
  Partnership,
  PartnershipActivity,
  PartnershipDocument,
  PartnershipRespondAction,
  PartnershipStats,
  PlatformNotification,
  RelationshipType,
} from "@/types/partnership";

type Pagination = {
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

function authOpts(token: string) {
  return { token };
}

export const partnershipsApi = {
  getMeta: (token: string) =>
    apiRequest<{ success: boolean; relationshipTypes: RelationshipType[] }>(
      "/partnerships/meta",
      authOpts(token),
    ),

  getStats: (token: string) =>
    apiRequest<{ success: boolean; stats: PartnershipStats }>(
      "/partnerships/stats",
      authOpts(token),
    ),

  list: (
    token: string,
    params?: Record<string, string | number | undefined>,
  ) => {
    const qs = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "" && value !== "all") {
          qs.set(key, String(value));
        }
      }
    }
    const query = qs.toString();
    return apiRequest<{
      success: boolean;
      partnerships: Partnership[];
      pagination: Pagination;
    }>(`/partnerships${query ? `?${query}` : ""}`, authOpts(token));
  },

  get: (token: string, id: string) =>
    apiRequest<{ success: boolean; partnership: Partnership }>(
      `/partnerships/${id}`,
      authOpts(token),
    ),

  createRequest: (token: string, payload: CreatePartnershipRequestPayload) =>
    apiRequest<{ success: boolean; partnership: Partnership }>(
      "/partnerships/requests",
      { method: "POST", body: payload, token },
    ),

  respond: (
    token: string,
    id: string,
    action: PartnershipRespondAction,
    responseMessage?: string,
  ) =>
    apiRequest<{ success: boolean; partnership: Partnership }>(
      `/partnerships/${id}/respond`,
      { method: "POST", body: { action, responseMessage }, token },
    ),

  update: (
    token: string,
    id: string,
    payload: Partial<{
      status: string;
      objectives: string;
      description: string;
      startDate: string;
      expectedDuration: string;
    }>,
  ) =>
    apiRequest<{ success: boolean; partnership: Partnership }>(
      `/partnerships/${id}`,
      { method: "PATCH", body: payload, token },
    ),

  getActivity: (token: string, id: string, page = 1) =>
    apiRequest<{
      success: boolean;
      activity: PartnershipActivity[];
      pagination: Pagination;
    }>(`/partnerships/${id}/activity?page=${page}`, authOpts(token)),

  listDocuments: (token: string, id: string) =>
    apiRequest<{ success: boolean; documents: PartnershipDocument[] }>(
      `/partnerships/${id}/documents`,
      authOpts(token),
    ),

  addDocument: (
    token: string,
    id: string,
    payload: {
      name: string;
      type: string;
      fileUrl?: string;
      fileName?: string;
      expiryDate?: string;
    },
  ) =>
    apiRequest<{ success: boolean; document: PartnershipDocument }>(
      `/partnerships/${id}/documents`,
      { method: "POST", body: payload, token },
    ),
};

export const discoveryApi = {
  searchCompanies: (
    token: string,
    params?: Record<string, string | number | undefined>,
  ) => {
    const qs = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "" && value !== "all") {
          qs.set(key, String(value));
        }
      }
    }
    const query = qs.toString();
    return apiRequest<{ success: boolean; companies: DiscoverableCompany[]; pagination: Pagination }>(
      `/discovery/companies${query ? `?${query}` : ""}`,
      authOpts(token),
    );
  },

  searchInstitutions: (
    token: string,
    params?: Record<string, string | number | undefined>,
  ) => {
    const qs = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "" && value !== "all") {
          qs.set(key, String(value));
        }
      }
    }
    const query = qs.toString();
    return apiRequest<{
      success: boolean;
      institutions: DiscoverableInstitution[];
      pagination: Pagination;
    }>(`/discovery/institutions${query ? `?${query}` : ""}`, authOpts(token));
  },
};

type DiscoverableCompany = import("@/types/partnership").DiscoverableCompany;
type DiscoverableInstitution = import("@/types/partnership").DiscoverableInstitution;

export const platformNotificationsApi = {
  list: (token: string, page = 1) =>
    apiRequest<{
      success: boolean;
      notifications: PlatformNotification[];
      pagination: Pagination;
    }>(`/platform-notifications?page=${page}`, authOpts(token)),

  unreadCount: (token: string) =>
    apiRequest<{ success: boolean; count: number }>(
      "/platform-notifications/unread-count",
      authOpts(token),
    ),

  markRead: (token: string, id: string) =>
    apiRequest(`/platform-notifications/${id}/read`, {
      method: "PATCH",
      token,
    }),

  markAllRead: (token: string) =>
    apiRequest("/platform-notifications/read-all", { method: "POST", token }),
};
