/**
 * Client storage key constants.
 */

export const STORAGE_KEYS = {
  theme: "dreamwave-theme",
  sidebarCollapsed: "dreamwave-sidebar-collapsed",
  locale: "dreamwave-locale",
  authToken: "dreamwave-auth-token",
  authRemember: "dreamwave-auth-remember",
  passwordResetChallenge: "dreamwave-password-reset-challenge",
  onboardingRole: "dreamwave-onboarding-role",
  institutionData: "dreamwave-institution-data",
  knowledgeData: "dreamwave-knowledge-data",
  aiPlatformData: "dreamwave-ai-platform-data",
  learnData: "dreamwave-learn-data",
  companyData: "dreamwave-company-data",
  researchData: "dreamwave-research-data",
  careerIntelData: "dreamwave-career-intel-data",
  communityData: "dreamwave-community-data",
  workspaceData: "dreamwave-workspace-data",
  personalizationData: "dreamwave-personalization-data",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
