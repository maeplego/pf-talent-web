export type EmploymentType = "full_time" | "contract" | "part_time" | "internship";

export type Job = {
  id: string;
  employerSub: string;
  title: string;
  status: "draft" | "published";
  employmentType: EmploymentType;
  location: string;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string[];
  description: string;
};

export type Facets = {
  total: number;
  employmentType: Record<string, number>;
  remote: Record<string, number>;
  skills: Record<string, number>;
};

export type SimilarJobs = {
  source: "recommend" | "fallback";
  jobs: Job[];
};

export type Application = {
  id: string;
  jobId: string;
  candidateSub: string;
  resumeSnapshot: string;
  status: "applied" | "document_passed" | "interview" | "offered" | "rejected";
  calendarExternalRef?: string;
  interviewBookingId?: string;
};

export type CandidateProfile = {
  sub: string;
  displayName: string;
  skills: string[];
  desiredEmploymentTypes: EmploymentType[];
  desiredMinSalary: number | null;
  desiredRemote: boolean;
  bio: string;
};

export type SavedSearch = {
  id: string;
  candidateSub: string;
  name: string;
  query: string;
  employmentType?: EmploymentType;
  remote?: boolean;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  lastRunAt: string | null;
};

export type Report = {
  id: string;
  reporterSub: string;
  jobId: string;
  reason: string;
  status: "open" | "reviewed";
  createdAt: string;
};

export type InterviewSlotsPayload = {
  slug: string;
  name: string;
  durationMinutes: number;
  hostTimeZone: string;
  starts: string[];
};
