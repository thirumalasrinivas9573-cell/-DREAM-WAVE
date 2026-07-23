"use client";

import { PLACEMENT_SEED } from "@/constants/placement-management-seed";
import { STORAGE_KEYS } from "@/constants/storage";
import { createAppStore } from "@/store";
import type {
  ApplicationStage,
  Internship,
  Interview,
  Job,
  Offer,
  PlacementDrive,
  PlacementState,
  Recruiter,
} from "@/types/placement-management";
import { getJsonStorageItem, setJsonStorageItem } from "@/utils/storage";

type PlacementStore = PlacementState & {
  hydrated: boolean;
  hydrate: () => void;
  upsertRecruiter: (record: Recruiter) => void;
  removeRecruiter: (id: string) => void;
  upsertDrive: (record: PlacementDrive) => void;
  removeDrive: (id: string) => void;
  upsertInternship: (record: Internship) => void;
  removeInternship: (id: string) => void;
  upsertJob: (record: Job) => void;
  removeJob: (id: string) => void;
  updateApplicationStage: (id: string, stage: ApplicationStage) => void;
  removeApplication: (id: string) => void;
  upsertInterview: (record: Interview) => void;
  removeInterview: (id: string) => void;
  upsertOffer: (record: Offer) => void;
  removeOffer: (id: string) => void;
};

function persist(state: PlacementState) {
  setJsonStorageItem(STORAGE_KEYS.institutionPlacements, state);
}

function snapshot(store: PlacementStore): PlacementState {
  return {
    recruiters: store.recruiters,
    drives: store.drives,
    internships: store.internships,
    jobs: store.jobs,
    applications: store.applications,
    interviews: store.interviews,
    offers: store.offers,
  };
}

function upsertById<T extends { id: string }>(list: T[], record: T): T[] {
  return list.some((item) => item.id === record.id)
    ? list.map((item) => (item.id === record.id ? record : item))
    : [record, ...list];
}

export const usePlacementManagementStore = createAppStore<PlacementStore>(
  (set, get) => {
    const commit = (patch: Partial<PlacementState>) => {
      set(patch);
      persist(snapshot({ ...get(), ...patch } as PlacementStore));
    };

    return {
      ...PLACEMENT_SEED,
      hydrated: false,
      hydrate: () => {
        const stored = getJsonStorageItem<PlacementState>(
          STORAGE_KEYS.institutionPlacements,
        );
        set(
          stored && Array.isArray(stored.recruiters)
            ? { ...stored, hydrated: true }
            : { ...PLACEMENT_SEED, hydrated: true },
        );
      },
      upsertRecruiter: (record) =>
        commit({ recruiters: upsertById(get().recruiters, record) }),
      removeRecruiter: (id) =>
        commit({ recruiters: get().recruiters.filter((item) => item.id !== id) }),
      upsertDrive: (record) => commit({ drives: upsertById(get().drives, record) }),
      removeDrive: (id) =>
        commit({ drives: get().drives.filter((item) => item.id !== id) }),
      upsertInternship: (record) =>
        commit({ internships: upsertById(get().internships, record) }),
      removeInternship: (id) =>
        commit({ internships: get().internships.filter((item) => item.id !== id) }),
      upsertJob: (record) => commit({ jobs: upsertById(get().jobs, record) }),
      removeJob: (id) => commit({ jobs: get().jobs.filter((item) => item.id !== id) }),
      updateApplicationStage: (id, stage) =>
        commit({
          applications: get().applications.map((item) =>
            item.id === id ? { ...item, stage } : item,
          ),
        }),
      removeApplication: (id) =>
        commit({ applications: get().applications.filter((item) => item.id !== id) }),
      upsertInterview: (record) =>
        commit({ interviews: upsertById(get().interviews, record) }),
      removeInterview: (id) =>
        commit({ interviews: get().interviews.filter((item) => item.id !== id) }),
      upsertOffer: (record) => commit({ offers: upsertById(get().offers, record) }),
      removeOffer: (id) =>
        commit({ offers: get().offers.filter((item) => item.id !== id) }),
    };
  },
);
