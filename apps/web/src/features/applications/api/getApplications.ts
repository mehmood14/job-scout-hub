import { API_URL } from "../../../config";
import type { ApplicationStatus } from "@job-scout/shared";

export class AuthenticationError extends Error {
  constructor() {
    super("Your session has expired.");
  }
}

export type Application = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  source: string | null;
  salaryExpectation: string | null;
  appliedDate: string | null;
  recruiterContacted: boolean;
  recruiterName: string | null;
  followUpDate: string | null;
  excitement: string | null;
  excitedAbout: boolean;
  workStyle: string | null;
  whyCompany: string | null;
  cultureNotes: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  currentStatusOccurredAt: string | null;
};

export async function getApplications(): Promise<Application[]> {
  const response = await fetch(`${API_URL}/applications`, { credentials: "include" });

  if (response.status === 401) {
    throw new AuthenticationError();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}
