import { useQuery } from "@tanstack/react-query";
import { getApplications } from "../api/getApplications";

const statuses = [
  "Applied",
  "Recruiter Contacted",
  "Interview",
  "Technical Interview",
  "Offer",
] as const;

export function Journey() {
  const { data: applications = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  return (
    <section>
      <h2>The journey so far</h2>

      <div>
        {statuses.map((status, index) => {
          const count = applications.filter(
            (application) => application.status === status,
          ).length;

          return (
            <span key={status}>
              <strong>{count}</strong> {status}

              {index < statuses.length - 1 && " → "}
            </span>
          );
        })}
      </div>
    </section>
  );
}