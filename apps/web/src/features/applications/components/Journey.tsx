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
    <section className="journey">
      <h2>The journey so far</h2>

      <div className="journey-steps">
        {statuses.map((status, index) => {
          const count = applications.filter(
            (application) => application.status === status,
          ).length;

          return (
            <div key={status} className="journey-step">
              <strong>{count}</strong>
              <span>{status}</span>

              {index < statuses.length - 1 && (
                <span className="journey-arrow">→</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}