import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@job-scout/shared";

import { useAuth } from "../../auth/AuthContext";
import { useModalDialog } from "../../../components/useModalDialog";
import type { Application } from "../api/getApplications";
import {
  getApplicationTimeline,
  type ApplicationTimelineEvent,
} from "../api/getApplicationTimeline";
import { updateApplicationTimelineOrder } from "../api/updateApplicationTimelineOrder";
import { upsertApplicationTimelineEvent } from "../api/upsertApplicationTimelineEvent";
import { updateApplication } from "../api/updateApplication";
import { updateApplicationTimelineSkippedStatuses } from "../api/updateApplicationTimelineSkippedStatuses";
import { timelineEventForStatus, timelineStepState } from "./timelineUtils";

type ApplicationTimelineModalProps = {
  application: Application;
  onClose: () => void;
};

const finalStatuses = new Set<ApplicationStatus>(["Offer", "Rejected", "Parked"]);

export function ApplicationTimelineModal({
  application,
  onClose,
}: ApplicationTimelineModalProps) {
  const { accessMode } = useAuth();
  const queryClient = useQueryClient();
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const [statusOrder, setStatusOrder] = useState<ApplicationStatus[]>([...APPLICATION_STATUSES]);
  const [draggedStatus, setDraggedStatus] = useState<ApplicationStatus | null>(null);
  const [editingStatus, setEditingStatus] = useState<ApplicationStatus | null>(null);
  const [dateTimeValue, setDateTimeValue] = useState("");
  const [currentStatus, setCurrentStatus] = useState(application.status);
  const [skippedStatuses, setSkippedStatuses] = useState<ApplicationStatus[]>([]);
  const { data, isPending, isError } = useQuery({
    queryKey: ["application-timeline", application.id],
    queryFn: () => getApplicationTimeline(application.id),
  });
  const events = data?.events ?? [];
  const isViewer = accessMode === "viewer";
  const visibleStatuses = statusOrder.filter((status) => !skippedStatuses.includes(status));

  const saveOrderMutation = useMutation({
    mutationFn: updateApplicationTimelineOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["application-timeline", application.id],
      });
    },
  });
  const saveTimelineEventMutation = useMutation({
    mutationFn: upsertApplicationTimelineEvent,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["application-timeline", application.id] }),
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
      ]);
      setEditingStatus(null);
    },
  });
  const changeStatusMutation = useMutation({
    mutationFn: (status: ApplicationStatus) => updateApplication({
      id: application.id,
      status,
    }),
    onMutate: (status) => {
      const previousStatus = currentStatus;
      setCurrentStatus(status);
      return { previousStatus };
    },
    onError: (_error, _status, context) => {
      if (context) setCurrentStatus(context.previousStatus);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["application-timeline", application.id] }),
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
      ]);
    },
  });
  const saveSkippedStatusesMutation = useMutation({
    mutationFn: updateApplicationTimelineSkippedStatuses,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["application-timeline", application.id],
      });
    },
  });

  useEffect(() => {
    if (data && isStatusOrder(data.statusOrder)) {
      // This query response is the persisted source of truth for the editable timeline.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatusOrder(data.statusOrder);
    }
    if (data && isSkippedStatuses(data.skippedStatuses)) {
      setSkippedStatuses(data.skippedStatuses);
    }
  }, [data]);

  useEffect(() => {
    // Reset optimistic state when a different application is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentStatus(application.status);
  }, [application.status]);

  useModalDialog({ dialogRef: dialog, initialFocusRef: closeButton, onClose });

  function saveStatusOrder(nextOrder: ApplicationStatus[]): void {
    setStatusOrder(nextOrder);
    saveOrderMutation.mutate({
      applicationId: application.id,
      statusOrder: nextOrder,
    });
  }

  function moveStatus(status: ApplicationStatus, direction: -1 | 1): void {
    const currentIndex = statusOrder.indexOf(status);
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= statusOrder.length) return;

    const nextOrder = [...statusOrder];
    const [movedStatus] = nextOrder.splice(currentIndex, 1);
    if (!movedStatus) return;
    nextOrder.splice(nextIndex, 0, movedStatus);
    saveStatusOrder(nextOrder);
  }

  function handleDrop(targetStatus: ApplicationStatus): void {
    if (!draggedStatus || draggedStatus === targetStatus) return;

    const nextOrder = statusOrder.filter((status) => status !== draggedStatus);
    const targetIndex = nextOrder.indexOf(targetStatus);
    nextOrder.splice(targetIndex, 0, draggedStatus);
    setDraggedStatus(null);
    saveStatusOrder(nextOrder);
  }

  function saveSkippedStatuses(nextSkippedStatuses: ApplicationStatus[]): void {
    setSkippedStatuses(nextSkippedStatuses);
    saveSkippedStatusesMutation.mutate({
      applicationId: application.id,
      skippedStatuses: nextSkippedStatuses,
    });
  }

  function skipStatus(status: ApplicationStatus): void {
    saveSkippedStatuses([...skippedStatuses, status]);
  }

  function restoreStatus(status: ApplicationStatus): void {
    saveSkippedStatuses(skippedStatuses.filter((item) => item !== status));
  }

  function startDateTimeEdit(
    status: ApplicationStatus,
    event: ApplicationTimelineEvent | undefined,
  ): void {
    setEditingStatus(status);
    setDateTimeValue(toDateTimeLocalValue(event?.occurredAt ?? new Date().toISOString()));
  }

  function saveDateTime(
    event: FormEvent<HTMLFormElement>,
    status: ApplicationStatus,
  ): void {
    event.preventDefault();
    if (!dateTimeValue) return;

    saveTimelineEventMutation.mutate({
      applicationId: application.id,
      status,
      occurredAt: dateTimeValue,
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        ref={dialog}
        className="timeline-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timeline-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">Recruitment timeline</p>
            <h2 id="timeline-modal-title">{application.company}</h2>
            <p className="timeline-role">{application.role}</p>
          </div>
          <button ref={closeButton} className="icon-button" type="button" onClick={onClose} aria-label="Close application timeline">×</button>
        </div>

        {!isViewer && <p className="timeline-reorder-hint">Drag a step to arrange this application’s journey. Reorder controls are available when a step is hovered or focused.</p>}
        {isPending && <p className="loading-state">Loading timeline...</p>}
        {isError && <p className="error-state">Could not load the recruitment timeline.</p>}
        {!isPending && !isError && (
          <ol className="recruitment-timeline">
            {visibleStatuses.map((status, index) => {
              const event = timelineEventForStatus(events, status, application.appliedDate);
              const isCurrent = status === currentStatus;
              const isFinal = finalStatuses.has(status);
              const currentStepState = isCurrent
                ? timelineStepState(event)
                : null;

              return (
                <li
                  key={status}
                  className={`timeline-entry${event ? " is-complete" : ""}${isCurrent ? " is-current" : ""}${isFinal ? " is-final" : ""}${draggedStatus === status ? " is-dragging" : ""}`}
                  draggable={!isViewer}
                  onDragStart={(dragEvent) => {
                    if (isViewer) return;
                    dragEvent.dataTransfer.effectAllowed = "move";
                    setDraggedStatus(status);
                  }}
                  onDragOver={(dragEvent) => {
                    if (!isViewer) dragEvent.preventDefault();
                  }}
                  onDrop={() => handleDrop(status)}
                  onDragEnd={() => setDraggedStatus(null)}
                >
                  <span className="timeline-marker" aria-hidden="true" />
                  <div className="timeline-entry-content">
                    <div className="timeline-entry-heading">
                      <strong>{status}</strong>
                      {isCurrent && <span className="current-status">Current</span>}
                      {currentStepState && <span className={`timeline-step-state is-${currentStepState.toLowerCase()}`}>{timelineStepStateLabel(currentStepState)}</span>}
                      {isFinal && <span className="final-status">Final</span>}
                    </div>
                    {event ? <TimelineTime event={event} /> : <span className="timeline-pending">{isCurrent ? "Next up" : "Not reached yet"}</span>}
                    {!isViewer && editingStatus !== status && (
                      <button
                        className="timeline-date-button"
                        type="button"
                        onClick={() => startDateTimeEdit(status, event)}
                      >
                        {event ? "Edit date & time" : "Set date & time"}
                      </button>
                    )}
                    {!isViewer && !isCurrent && (
                      <button
                        className="timeline-status-button"
                        type="button"
                        onClick={() => changeStatusMutation.mutate(status)}
                        disabled={changeStatusMutation.isPending}
                        aria-label={`Change application status to ${status}`}
                      >
                        Set current
                      </button>
                    )}
                    {!isViewer && !isCurrent && (
                      <button
                        className="timeline-skip-button"
                        type="button"
                        onClick={() => skipStatus(status)}
                        disabled={saveSkippedStatusesMutation.isPending}
                      >
                        Skip step
                      </button>
                    )}
                    {!isViewer && editingStatus === status && (
                      <form className="timeline-date-form" onSubmit={(formEvent) => saveDateTime(formEvent, status)}>
                        <label>
                          <span className="visually-hidden">{status} date and time</span>
                          <input type="datetime-local" value={dateTimeValue} onChange={(inputEvent) => setDateTimeValue(inputEvent.target.value)} required autoFocus />
                        </label>
                        <button className="primary-button" type="submit" disabled={saveTimelineEventMutation.isPending}>Save</button>
                        <button type="button" onClick={() => setEditingStatus(null)} disabled={saveTimelineEventMutation.isPending}>Cancel</button>
                      </form>
                    )}
                  </div>
                  {!isViewer && (
                    <div className="timeline-reorder-controls">
                      <button type="button" onClick={() => moveStatus(status, -1)} disabled={index === 0 || saveOrderMutation.isPending} aria-label={`Move ${status} up`}>↑</button>
                      <button type="button" onClick={() => moveStatus(status, 1)} disabled={index === visibleStatuses.length - 1 || saveOrderMutation.isPending} aria-label={`Move ${status} down`}>↓</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        {skippedStatuses.length > 0 && (
          <details className="skipped-timeline-steps">
            <summary>Skipped steps ({skippedStatuses.length})</summary>
            <ul>
              {skippedStatuses.map((status) => (
                <li key={status}>
                  <span>{status}</span>
                  {!isViewer && <button type="button" onClick={() => restoreStatus(status)} disabled={saveSkippedStatusesMutation.isPending}>Add back</button>}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}

function TimelineTime({ event }: { event: ApplicationTimelineEvent }) {
  return (
    <time dateTime={event.occurredAt}>
      <span>{formatDate(event.occurredAt)}</span>
      <span aria-hidden="true"> · </span>
      <span>{formatTime(event.occurredAt)}</span>
    </time>
  );
}

function isStatusOrder(value: unknown): value is ApplicationStatus[] {
  return Array.isArray(value)
    && value.length === APPLICATION_STATUSES.length
    && value.every((status) => typeof status === "string" && APPLICATION_STATUSES.includes(status as ApplicationStatus))
    && new Set(value).size === APPLICATION_STATUSES.length;
}

function isSkippedStatuses(value: unknown): value is ApplicationStatus[] {
  return Array.isArray(value)
    && value.every((status) => typeof status === "string" && APPLICATION_STATUSES.includes(status as ApplicationStatus))
    && new Set(value).size === value.length;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}


function timelineStepStateLabel(state: "Finished" | "Upcoming"): string {
  return state === "Finished" ? "Finished — waiting for response" : state;
}

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}
