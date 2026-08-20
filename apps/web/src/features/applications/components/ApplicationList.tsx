import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ApplicationStatus } from "@job-scout/shared";

import { AuthenticationError, getApplications, type Application } from "../api/getApplications";
import { ApplicationModal } from "./ApplicationModal";
import { ApplicationTimelineModal } from "./ApplicationTimelineModal";
import { useAuth } from "../../auth/AuthContext";

export type SortOption = "default" | "status-asc" | "status-desc" | "company-asc" | "company-desc";

type ApplicationListProps = {
  filters: {
    search: string;
    status: "All" | ApplicationStatus;
    sortBy: SortOption;
  };
};

const pageSizes = [10, 20, 30, 50, 100] as const;
type PageSize = (typeof pageSizes)[number];

function statusClassName(status: ApplicationStatus): string {
  return `status-badge status-${status.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`;
}

export function ApplicationList({ filters }: ApplicationListProps) {
  const { logout } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [timelineApplication, setTimelineApplication] = useState<Application | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const { data: applications = [], isPending, isError, error } = useQuery({ queryKey: ["applications"], queryFn: getApplications });

  useEffect(() => {
    if (isError && error instanceof AuthenticationError) {
      void logout();
    }
  }, [error, isError, logout]);

  const filteredApplications = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const result = applications.filter((application) => {
      const matchesSearch = !search || application.company.toLowerCase().includes(search) || application.role.toLowerCase().includes(search);
      return matchesSearch && (filters.status === "All" || application.status === filters.status);
    });
    if (filters.sortBy === "status-asc") return result.toSorted((first, second) => first.status.localeCompare(second.status));
    if (filters.sortBy === "status-desc") return result.toSorted((first, second) => second.status.localeCompare(first.status));
    if (filters.sortBy === "company-asc") return result.toSorted((first, second) => first.company.localeCompare(second.company));
    if (filters.sortBy === "company-desc") return result.toSorted((first, second) => second.company.localeCompare(first.company));
    return result;
  }, [applications, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedApplications = filteredApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (isPending) return <p className="loading-state">Loading applications...</p>;
  if (isError) return <p className="error-state">Could not load applications. Your session may have expired.</p>;

  return (
    <>
      <section className="application-table-panel" aria-label="Applications shortlist">
        <div className="application-table-panel-header">
          <div>
            <span>Your shortlist</span>
            <strong>Applications in focus</strong>
          </div>
          <p className="application-count">{filteredApplications.length === applications.length ? `${applications.length} applications` : `${filteredApplications.length} of ${applications.length} applications`}</p>
        </div>
        <div className="application-table-wrapper">
          <table className="application-table">
            <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Applied</th><th>Salary expectation</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
            <tbody>
              {pagedApplications.map((application) => (
                <tr key={application.id} className="application-row">
                  <td className="application-company">
                    <span className="company-cell"><span className="company-monogram" aria-hidden="true">{application.company.charAt(0).toUpperCase()}</span><span>{application.company}</span></span>
                  </td>
                  <td className="application-role"><span>{application.role}</span>{application.recruiterName && <small>{application.recruiterName}</small>}</td>
                  <td>
                    <div className="table-status">
                      <span className={statusClassName(application.status)}>{application.status}</span>
                      <span className={`table-status-state is-${timelineState(application.currentStatusOccurredAt).toLowerCase()}`}>
                        {timelineStateLabel(timelineState(application.currentStatusOccurredAt))}
                      </span>
                      {isUpcoming(application.currentStatusOccurredAt) && (
                        <time className="table-status-time" dateTime={application.currentStatusOccurredAt ?? undefined}>
                          {formatStatusDateTime(application.currentStatusOccurredAt)}
                        </time>
                      )}
                    </div>
                  </td>
                  <td className="application-applied-date">{formatAppliedDate(application.appliedDate)}</td>
                  <td className="application-salary">{application.salaryExpectation ?? "—"}</td>
                  <td className="timeline-action-cell">
                    <div className="application-row-actions">
                      <button
                        className="edit-application-button"
                        type="button"
                        aria-label={`Edit application for ${application.company}`}
                        title="Edit application"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 4.3 19.7 10.3M4 20l4.4-1 10.3-10.3a2.1 2.1 0 0 0-3-3L5.4 16 4 20Z" /></svg>
                      </button>
                      <button
                        className="timeline-button"
                        type="button"
                        aria-label={`View application timeline for ${application.company}`}
                        title="View application timeline"
                        onClick={() => setTimelineApplication(application)}
                      >
                        <span aria-hidden="true">◷</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApplications.length === 0 && <tr><td colSpan={6} className="empty-state">No applications found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <nav className="pagination" aria-label="Applications pagination">
        <label className="page-size-control">
          Show
          <select
            value={pageSize}
            onChange={(event) => {
              const nextPageSize = Number(event.target.value);

              if (isPageSize(nextPageSize)) {
                setPageSize(nextPageSize);
                setPage(1);
              }
            }}
          >
            {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          entries
        </label>
        {totalPages > 1 && <div className="page-navigation"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1}>Previous</button><span>Page {currentPage} of {totalPages}</span><button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={currentPage === totalPages}>Next</button></div>}
      </nav>
      {selectedApplication && <ApplicationModal application={selectedApplication} onClose={() => setSelectedApplication(null)} />}
      {timelineApplication && <ApplicationTimelineModal application={timelineApplication} onClose={() => setTimelineApplication(null)} />}
    </>
  );
}

function isPageSize(value: number): value is PageSize {
  return pageSizes.includes(value as PageSize);
}

function formatAppliedDate(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function timelineState(value: string | null): "Finished" | "Upcoming" {
  return value && new Date(value).getTime() <= Date.now()
    ? "Finished"
    : "Upcoming";
}

function isUpcoming(value: string | null): value is string {
  return value !== null && new Date(value).getTime() > Date.now();
}

function timelineStateLabel(state: "Finished" | "Upcoming"): string {
  return state === "Finished" ? "Finished — waiting for response" : state;
}

function formatStatusDateTime(value: string | null): string {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
