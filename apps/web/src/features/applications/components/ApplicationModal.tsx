import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APPLICATION_STATUSES } from "@job-scout/shared";

import { useAuth } from "../../auth/AuthContext";
import type { Application } from "../api/getApplications";
import { deleteApplication } from "../api/deleteApplication";
import { updateApplication } from "../api/updateApplication";

type ApplicationModalProps = {
  application: Application;
  onClose: () => void;
};

export function ApplicationModal({ application, onClose }: ApplicationModalProps) {
  const { accessMode } = useAuth();
  const queryClient = useQueryClient();
  const closeButton = useRef<HTMLButtonElement>(null);
  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role);
  const [status, setStatus] = useState(application.status);
  const [appliedDate, setAppliedDate] = useState(application.appliedDate?.slice(0, 10) ?? "");
  const [recruiterName, setRecruiterName] = useState(application.recruiterName ?? "");
  const [salaryExpectation, setSalaryExpectation] = useState(application.salaryExpectation ?? "");
  const [description, setDescription] = useState(application.description ?? "");

  const updateMutation = useMutation({
    mutationFn: updateApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      onClose();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      onClose();
    },
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    updateMutation.mutate({
      id: application.id,
      company: company.trim(),
      role: role.trim(),
      status,
      appliedDate,
      recruiterName: recruiterName.trim() || null,
      salaryExpectation: salaryExpectation.trim() || null,
      description: description.trim() || null,
    });
  }

  const isViewer = accessMode === "viewer";

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="application-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">{isViewer ? "Sample application" : "Application details"}</p>
            <h2 id="application-modal-title">{application.company}</h2>
          </div>
          <button ref={closeButton} className="icon-button" type="button" onClick={onClose} aria-label="Close application details">×</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Company<input value={company} onChange={(event) => setCompany(event.target.value)} readOnly={isViewer} required /></label>
          <label>Role<input value={role} onChange={(event) => setRole(event.target.value)} readOnly={isViewer} required /></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} disabled={isViewer}>{APPLICATION_STATUSES.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          <label>Applied date<input type="date" value={appliedDate} onChange={(event) => setAppliedDate(event.target.value)} readOnly={isViewer} required={!isViewer} /></label>
          <label>Recruiter name<input value={recruiterName} onChange={(event) => setRecruiterName(event.target.value)} readOnly={isViewer} placeholder="Alex Andersson" /></label>
          <label>Salary expectation<input value={salaryExpectation} onChange={(event) => setSalaryExpectation(event.target.value)} readOnly={isViewer} placeholder="65 000 SEK/mo" /></label>
          <label className="modal-description">Description and job details<textarea value={description} onChange={(event) => setDescription(event.target.value)} readOnly={isViewer} rows={7} placeholder="Posting URL, interview notes, recruiter details..." /></label>
          {!isViewer && <div className="modal-actions"><button className="delete-button" type="button" onClick={() => deleteMutation.mutate(application.id)} disabled={deleteMutation.isPending}>Delete</button><button className="primary-button" type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save changes"}</button></div>}
        </form>
      </section>
    </div>
  );
}
