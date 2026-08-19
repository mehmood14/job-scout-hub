import { useMemo, useState } from "react";

import { ApplicationList } from "./ApplicationList";
import "./ApplicationsWorkspace.css";

export function ApplicationsWorkspace() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const filters = useMemo(
    () => ({
      search,
      status,
      sortBy,
    }),
    [search, status, sortBy],
  );

  return (
    <section className="applications-workspace">
      <div className="applications-header">
        <div>
          <h2>All applications</h2>
          <p>Your detailed application workspace.</p>
        </div>
      </div>

      <div className="application-controls">
        <input
          type="search"
          placeholder="Search company or role"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search applications"
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
        >
          <option value="All">All statuses</option>
          <option value="Applied">Applied</option>
          <option value="Recruiter Contacted">
            Recruiter Contacted
          </option>
          <option value="Interview">Interview</option>
          <option value="Technical Interview">
            Technical Interview
          </option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort applications"
        >
          <option value="default">Default order</option>
          <option value="status">Sort by status</option>
        </select>
      </div>

      <ApplicationList filters={filters} />
    </section>
  );
}