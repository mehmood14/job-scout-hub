import { useMemo, useState } from "react";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@job-scout/shared";

import { ApplicationList, type SortOption } from "./ApplicationList";
import "./ApplicationsWorkspace.css";

export function ApplicationsWorkspace() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | ApplicationStatus>("All");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const filters = useMemo(() => ({ search, status, sortBy }), [search, status, sortBy]);

  return (
    <section className="applications-workspace">
      <div className="applications-header"><div><h2>All applications</h2><p>Your detailed application workspace.</p></div></div>
      <div className="application-controls">
        <input type="search" placeholder="Search company or role" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search applications" />
        <select value={status} onChange={(event) => setStatus(event.target.value as "All" | ApplicationStatus)} aria-label="Filter by status">
          <option value="All">All statuses</option>
          {APPLICATION_STATUSES.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} aria-label="Sort applications">
          <option value="default">Default order</option>
          <option value="status-asc">Status A → Z</option>
          <option value="status-desc">Status Z → A</option>
          <option value="company-asc">Company A → Z</option>
          <option value="company-desc">Company Z → A</option>
        </select>
      </div>
      <ApplicationList filters={filters} />
    </section>
  );
}
