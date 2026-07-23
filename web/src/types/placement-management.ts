export type PlacementStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

export type ListingStatus = "open" | "closed" | "draft";

export type DriveMode = "online" | "offline" | "hybrid";

export type WorkMode = "remote" | "hybrid" | "office";

export type JobType = "full-time" | "part-time" | "contract" | "internship";

export type ApplicationStage =
  | "applied"
  | "shortlisted"
  | "assessment"
  | "interview"
  | "hr-round"
  | "selected"
  | "rejected"
  | "offer-accepted"
  | "offer-declined";

export type InterviewStatus = "scheduled" | "completed" | "cancelled";

export type OfferStatus = "released" | "accepted" | "declined" | "expired";

export type Recruiter = {
  id: string;
  logoInitials: string;
  name: string;
  industry: string;
  hrContact: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  about: string;
  hiringDepartments: string[];
  requiredSkills: string[];
  hiringProcess: string[];
  pastPlacements: number;
  internshipsCount: number;
  jobsCount: number;
  driveStatus: PlacementStatus;
  status: "active" | "inactive";
};

export type PlacementDrive = {
  id: string;
  name: string;
  companyId: string;
  date: string;
  venue: string;
  mode: DriveMode;
  eligibleDepartments: string[];
  eligiblePrograms: string[];
  minCgpa: number;
  maxBacklogs: number;
  skillsRequired: string[];
  registrationDeadline: string;
  status: PlacementStatus;
};

export type Internship = {
  id: string;
  title: string;
  companyId: string;
  duration: string;
  location: string;
  workMode: WorkMode;
  stipend: number;
  eligibility: string;
  requiredSkills: string[];
  deadline: string;
  openPositions: number;
  status: ListingStatus;
};

export type Job = {
  id: string;
  title: string;
  companyId: string;
  salary: number;
  location: string;
  experience: string;
  eligibility: string;
  jobType: JobType;
  deadline: string;
  selectionProcess: string[];
  status: ListingStatus;
};

export type PlacementApplication = {
  id: string;
  studentName: string;
  companyId: string;
  role: string;
  type: "drive" | "internship" | "job";
  department: string;
  cgpa: number;
  graduationYear: string;
  stage: ApplicationStage;
  appliedDate: string;
};

export type Interview = {
  id: string;
  studentName: string;
  companyId: string;
  role: string;
  date: string;
  time: string;
  panel: string;
  meetingLink: string;
  venue: string;
  status: InterviewStatus;
  feedback: string;
};

export type Offer = {
  id: string;
  studentName: string;
  companyId: string;
  role: string;
  department: string;
  salary: number;
  joiningDate: string;
  location: string;
  status: OfferStatus;
  expiryDate: string;
};

export type PlacementState = {
  recruiters: Recruiter[];
  drives: PlacementDrive[];
  internships: Internship[];
  jobs: Job[];
  applications: PlacementApplication[];
  interviews: Interview[];
  offers: Offer[];
};
