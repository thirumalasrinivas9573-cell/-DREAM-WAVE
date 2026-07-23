"use client";

import { ArrowDown, ArrowUp, Eye, MoreHorizontal } from "lucide-react";
import { memo } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { StudentStatusBadge } from "@/components/institution/students/student-management-ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ManagedStudent,
  StudentSortField,
} from "@/types/student-management";

function SortHead({
  field,
  label,
  current,
  direction,
  onSort,
}: {
  field: StudentSortField;
  label: string;
  current: StudentSortField;
  direction: "asc" | "desc";
  onSort: (field: StudentSortField) => void;
}) {
  const active = current === field;
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm outline-none focus-visible:ring-2"
        aria-label={`Sort by ${label}`}
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUp className="size-3" aria-hidden="true" />
          ) : (
            <ArrowDown className="size-3" aria-hidden="true" />
          )
        ) : null}
      </button>
    </TableHead>
  );
}

export const StudentDirectoryTable = memo(function StudentDirectoryTable({
  students,
  sortField,
  sortDirection,
  onSort,
  onView,
}: {
  students: ManagedStudent[];
  sortField: StudentSortField;
  sortDirection: "asc" | "desc";
  onSort: (field: StudentSortField) => void;
  onView: (student: ManagedStudent) => void;
}) {
  if (!students.length) {
    return (
      <EmptyState
        title="No students found"
        description="Adjust the directory search or advanced filters."
      />
    );
  }

  return (
    <Table className="min-w-[1500px]">
      <TableHeader>
        <TableRow>
          <TableHead>Photo</TableHead>
          <SortHead
            field="id"
            label="Student ID"
            current={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="rollNumber"
            label="Roll Number"
            current={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="fullName"
            label="Full Name"
            current={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="department"
            label="Department"
            current={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="course"
            label="Course"
            current={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="semester"
            label="Semester"
            current={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
          <TableHead>Section</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <SortHead
            field="status"
            label="Status"
            current={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>
              <span
                className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl text-xs font-semibold"
                aria-label={`Photo placeholder for ${student.fullName}`}
              >
                {student.photoInitials}
              </span>
            </TableCell>
            <TableCell>
              <button
                type="button"
                onClick={() => onView(student)}
                className="text-primary focus-visible:ring-ring rounded-sm font-medium outline-none hover:underline focus-visible:ring-2"
              >
                {student.id}
              </button>
            </TableCell>
            <TableCell>{student.rollNumber}</TableCell>
            <TableCell className="font-medium">{student.fullName}</TableCell>
            <TableCell>{student.department}</TableCell>
            <TableCell>{student.course}</TableCell>
            <TableCell>{student.semester}</TableCell>
            <TableCell>{student.section}</TableCell>
            <TableCell>{student.academicYear}</TableCell>
            <TableCell>
              <a
                href={`mailto:${student.email}`}
                className="focus-visible:ring-ring rounded-sm outline-none hover:underline focus-visible:ring-2"
              >
                {student.email}
              </a>
            </TableCell>
            <TableCell>{student.phone}</TableCell>
            <TableCell>
              <StudentStatusBadge status={student.status} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`View ${student.fullName}`}
                  onClick={() => onView(student)}
                >
                  <Eye aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`More actions for ${student.fullName}`}
                  onClick={() => onView(student)}
                >
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
