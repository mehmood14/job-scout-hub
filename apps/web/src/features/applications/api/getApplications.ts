import { API_URL } from "../../../config";

export type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
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
  createdAt: string;
  updatedAt: string;
};

export async function getApplications(): Promise<Application[]> {
  const response = await fetch(`${API_URL}/applications`);

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}