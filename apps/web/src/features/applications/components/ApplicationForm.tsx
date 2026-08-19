import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [status, setStatus] = useState("Applied");
  const [salaryExpectation, setSalaryExpectation] = useState("");

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
        salaryExpectation: salaryExpectation.trim() || null,
      },
      {
        onSuccess: () => {
          setCompany("");
          setRole("");
          setStatus("Applied");
          setSalaryExpectation("");
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

        validApplications.push({
          company: companyValue.trim(),
          role: roleValue.trim(),
          status:
            "status" in application &&
            typeof application.status === "string"
              ? application.status
              : "Applied",
          salaryExpectation:
            "salaryExpectation" in application &&
            typeof application.salaryExpectation === "string"
              ? application.salaryExpectation
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
              onChange={(event) => setStatus(event.target.value)}
            >
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
    "status": "Applied"
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