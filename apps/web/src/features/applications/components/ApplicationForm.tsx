import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@job-scout/shared";

import {
  createApplication,
  createApplicationsBulk,
  type CreateApplicationInput,
} from "../api/createApplication";

type Mode = "manual" | "json";

export function ApplicationForm() {
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<Mode>("manual");

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [appliedDate, setAppliedDate] = useState(todayDate());
  const [recruiterName, setRecruiterName] = useState("");
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [description, setDescription] = useState("");

  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  const mutation = useMutation({
    mutationFn: createApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    },
  });

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    mutation.mutate(
      {
        company: company.trim(),
        role: role.trim(),
        status,
        appliedDate,
        recruiterName: recruiterName.trim() || null,
        salaryExpectation: salaryExpectation.trim() || null,
        description: description.trim() || null,
      },
      {
        onSuccess: () => {
          setCompany("");
          setRole("");
          setStatus("Applied");
          setAppliedDate(todayDate());
          setRecruiterName("");
          setSalaryExpectation("");
          setDescription("");
        },
      },
    );
  }

  async function handleJsonSubmit() {
    setJsonError(null);

    try {
      const parsed: unknown = JSON.parse(jsonInput);
      const applications = Array.isArray(parsed) ? parsed : [parsed];

      if (applications.length === 0) {
        setJsonError("No applications found.");
        return;
      }

      const validApplications: CreateApplicationInput[] = [];

      for (const application of applications) {
        if (
          typeof application !== "object" ||
          application === null ||
          !("company" in application) ||
          !("role" in application)
        ) {
          setJsonError(
            "Each application must contain company and role.",
          );
          return;
        }

        const companyValue = application.company;
        const roleValue = application.role;

        if (
          typeof companyValue !== "string" ||
          typeof roleValue !== "string" ||
          !companyValue.trim() ||
          !roleValue.trim()
        ) {
          setJsonError(
            "Company and role must be non-empty strings.",
          );
          return;
        }

        const record = application as Record<string, unknown>;
        const statusValue = record.status;

        if (statusValue !== undefined && (!isApplicationStatus(statusValue))) {
          setJsonError("Each status must be a supported application status.");
          return;
        }

        validApplications.push({
          company: companyValue.trim(),
          role: roleValue.trim(),
          status: statusValue ?? "Applied",
          ...(typeof record.appliedDate === "string"
            ? { appliedDate: record.appliedDate }
            : {}),
          recruiterName:
            typeof record.recruiterName === "string"
              ? record.recruiterName
              : null,
          salaryExpectation:
            typeof record.salaryExpectation === "string"
              ? record.salaryExpectation
              : null,
          description:
            typeof record.description === "string"
              ? record.description
              : null,
        });
      }

      setIsBulkImporting(true);

      await createApplicationsBulk(validApplications);

      setJsonInput("");

      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    } catch {
      setJsonError("Invalid JSON. Check the format and try again.");
    } finally {
      setIsBulkImporting(false);
    }
  }

  return (
    <section className="application-form-card">
      <div className="application-form-header">
        <div>
          <h2>New application</h2>
          <p>Add an application manually or import several at once.</p>
        </div>

        <div className="application-form-tabs">
          <button
            type="button"
            className={mode === "manual" ? "active" : ""}
            onClick={() => setMode("manual")}
          >
            Manual
          </button>

          <button
            type="button"
            className={mode === "json" ? "active" : ""}
            onClick={() => setMode("json")}
          >
            Add via JSON
          </button>
        </div>
      </div>

      {mode === "manual" && (
        <form
          className="application-form-grid"
          onSubmit={handleManualSubmit}
        >
          <label>
            Company
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Nordnet"
              required
            />
          </label>

          <label>
            Role
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Software Engineer"
              required
            />
          </label>

          <label>
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
            >
              {APPLICATION_STATUSES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Applied date
            <input
              type="date"
              value={appliedDate}
              onChange={(event) => setAppliedDate(event.target.value)}
              required
            />
          </label>

          <label>
            Recruiter name
            <input
              value={recruiterName}
              onChange={(event) => setRecruiterName(event.target.value)}
              placeholder="Alex Andersson"
            />
          </label>

          <label>
            Salary expectation
            <input
              value={salaryExpectation}
              onChange={(event) =>
                setSalaryExpectation(event.target.value)
              }
              placeholder="65 000 SEK/mo"
            />
          </label>

          <label className="application-form-description">
            Description and job details
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Posting URL, recruiter details, interview notes..."
            />
          </label>

          <div className="application-form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Adding..."
                : "Add application"}
            </button>
          </div>
        </form>
      )}

      {mode === "json" && (
        <div className="application-json-form">
          <label>
            Application JSON
            <textarea
              rows={12}
              value={jsonInput}
              onChange={(event) => {
                setJsonInput(event.target.value);
                setJsonError(null);
              }}
              placeholder={`[
  {
    "company": "Google",
    "role": "Frontend Engineer",
    "status": "Applied",
    "appliedDate": "2026-08-20",
    "recruiterName": "Alex Andersson"
  }
]`}
            />
          </label>

          {jsonError && (
            <p className="form-error">{jsonError}</p>
          )}

          <div className="application-form-actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleJsonSubmit}
              disabled={!jsonInput.trim() || isBulkImporting}
            >
              {isBulkImporting
                ? "Importing..."
                : "Import applications"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && APPLICATION_STATUSES.includes(value as ApplicationStatus);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
