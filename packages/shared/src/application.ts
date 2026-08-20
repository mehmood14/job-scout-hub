export const APPLICATION_STATUSES = [
  "Applied",
  "Recruiter Contacted",
  "Interview",
  "Technical Interview",
  "Test Assignment",
  "EM Interview",
  "VP/CTO Interview",
  "Cultural Interview",
  "Offer",
  "Parked",
  "Rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type AccessMode = "owner" | "viewer";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  description: string | null;
}
