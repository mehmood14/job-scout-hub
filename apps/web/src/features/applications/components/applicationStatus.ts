import type { ApplicationStatus } from "@job-scout/shared";

export function compareRecruitmentStatus(first: ApplicationStatus, second: ApplicationStatus): number {
  const priority = (status: ApplicationStatus): number => {
    if (status === "Applied") return 2;
    if (status === "Rejected") return 1;
    return 0;
  };

  return priority(first) - priority(second) || first.localeCompare(second);
}
