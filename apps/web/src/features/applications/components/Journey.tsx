import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { APPLICATION_STATUSES } from "@job-scout/shared";

import { getApplications } from "../api/getApplications";

const finalStatuses = new Set(["Offer", "Rejected", "Parked"]);
const conversationStatuses = new Set([
  "Interview",
  "Technical Interview",
  "Test Assignment",
  "EM Interview",
  "VP/CTO Interview",
  "Cultural Interview",
]);

export function Journey() {
  const { data: applications = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const { inProgress, interviews, stageCounts } = useMemo(() => {
    const counts = new Map(APPLICATION_STATUSES.map((status) => [status, 0]));

    for (const application of applications) {
      counts.set(application.status, (counts.get(application.status) ?? 0) + 1);
    }

    return {
      inProgress: applications.filter((application) => !finalStatuses.has(application.status)).length,
      interviews: applications.filter((application) => conversationStatuses.has(application.status)).length,
      stageCounts: APPLICATION_STATUSES.map((status) => ({ status, count: counts.get(status) ?? 0 })).filter(({ count }) => count > 0),
    };
  }, [applications]);

  return (
    <section className="journey" aria-labelledby="journey-title">
      <div className="journey-header">
        <div>
          <p className="journey-eyebrow">Dashboard overview</p>
          <h2 id="journey-title">Journey so far</h2>
        </div>
        <span className="journey-total">{applications.length} total</span>
      </div>
      <div className="journey-metrics">
        <div><strong>{applications.length}</strong><span>Applications</span></div>
        <div><strong>{inProgress}</strong><span>In progress</span></div>
        <div><strong>{interviews}</strong><span>In interviews</span></div>
      </div>
      {stageCounts.length > 0 && (
        <div className="journey-stages" aria-label="Application counts by stage">
          {stageCounts.map(({ status, count }) => <span key={status} className="journey-stage"><strong>{count}</strong>{status}</span>)}
        </div>
      )}
    </section>
  );
}
