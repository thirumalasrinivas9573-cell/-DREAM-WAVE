"use client";

import { STORAGE_KEYS } from "@/constants/storage";
import { STUDENT_MANAGEMENT_SEED } from "@/constants/student-management-seed";
import { createAppStore } from "@/store";
import type {
  ManagedStudent,
  ManagedStudentStatus,
} from "@/types/student-management";
import { getJsonStorageItem, setJsonStorageItem } from "@/utils/storage";

type StudentImportRow = Pick<
  ManagedStudent,
  | "fullName"
  | "email"
  | "phone"
  | "department"
  | "course"
  | "semester"
  | "section"
  | "gender"
>;

type StudentManagementStore = {
  students: ManagedStudent[];
  hydrated: boolean;
  hydrate: () => void;
  updateStudent: (id: string, patch: Partial<ManagedStudent>) => void;
  transferStudent: (
    id: string,
    department: string,
    course: string,
    section: string,
  ) => void;
  promoteSemester: (id: string) => void;
  updateStatus: (id: string, status: ManagedStudentStatus) => void;
  addNote: (id: string, text: string, author: string) => void;
  importStudents: (rows: StudentImportRow[]) => number;
};

function persist(students: ManagedStudent[]) {
  setJsonStorageItem(STORAGE_KEYS.institutionStudents, students);
}

export const useStudentManagementStore =
  createAppStore<StudentManagementStore>((set, get) => ({
    students: STUDENT_MANAGEMENT_SEED,
    hydrated: false,
    hydrate: () => {
      const stored = getJsonStorageItem<ManagedStudent[]>(
        STORAGE_KEYS.institutionStudents,
      );
      set({
        students: Array.isArray(stored) && stored.length
          ? stored
          : STUDENT_MANAGEMENT_SEED,
        hydrated: true,
      });
    },
    updateStudent: (id, patch) => {
      const students = get().students.map((student) =>
        student.id === id ? { ...student, ...patch } : student,
      );
      persist(students);
      set({ students });
    },
    transferStudent: (id, department, course, section) => {
      const students = get().students.map((student) =>
        student.id === id
          ? { ...student, department, course, branch: department, section }
          : student,
      );
      persist(students);
      set({ students });
    },
    promoteSemester: (id) => {
      const students = get().students.map((student) => {
        if (student.id !== id) return student;
        const current = Number(student.semester.match(/\d+/)?.[0] ?? 1);
        const next = Math.min(8, current + 1);
        return {
          ...student,
          semester: `Semester ${next}`,
          status: next === 8 && current === 8 ? ("graduated" as const) : student.status,
        };
      });
      persist(students);
      set({ students });
    },
    updateStatus: (id, status) => {
      const students = get().students.map((student) =>
        student.id === id ? { ...student, status } : student,
      );
      persist(students);
      set({ students });
    },
    addNote: (id, text, author) => {
      const students = get().students.map((student) =>
        student.id === id
          ? {
              ...student,
              notes: [
                {
                  id: `note-${Date.now().toString(36)}`,
                  text,
                  author,
                  createdAt: new Date().toISOString(),
                },
                ...student.notes,
              ],
            }
          : student,
      );
      persist(students);
      set({ students });
    },
    importStudents: (rows) => {
      const imported = rows.map((row, index) => {
        const template = structuredClone(STUDENT_MANAGEMENT_SEED[0]!);
        const sequence = String((Date.now() + index) % 10000).padStart(4, "0");
        const id = `STU-${new Date().getFullYear()}-${sequence}`;
        return {
          ...template,
          ...row,
          id,
          rollNumber: `NEW-${sequence}`,
          photoInitials: row.fullName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          status: "active" as const,
          admissionYear: String(new Date().getFullYear()),
          admissionDate: new Date().toISOString().slice(0, 10),
          notes: [],
        };
      });
      const students = [...imported, ...get().students];
      persist(students);
      set({ students });
      return imported.length;
    },
  }));
