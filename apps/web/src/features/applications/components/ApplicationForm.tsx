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
        company,
        role,
        status,
        salaryExpectation: salaryExpectation || null,
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

        const company = application.company;
        const role = application.role;

        if (
          typeof company !== "string" ||
          typeof role !== "string" ||
          !company.trim() ||
          !role.trim()
        ) {
          setJsonError(
            "Company and role must be non-empty strings.",
          );
          return;
        }

        validApplications.push({
          company,
          role,
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

await createApplicationsBulk(validApplications);

setJsonInput("");

await queryClient.invalidateQueries({

  queryKey: ["applications"],

});

      setJsonInput("");

      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    } catch {
      setJsonError("Invalid JSON. Check the format and try again.");
    }
  }

  return (
    <section>
      <div>
        <button
          type="button"
          onClick={() => setMode("manual")}
          disabled={mode === "manual"}
        >
          Manual
        </button>

        <button
          type="button"
          onClick={() => setMode("json")}
          disabled={mode === "json"}
        >
          Add via JSON
        </button>
      </div>

      {mode === "manual" && (
        <form onSubmit={handleManualSubmit}>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Company"
            required
          />

          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Role"
            required
          />

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

          <input
            value={salaryExpectation}
            onChange={(event) =>
              setSalaryExpectation(event.target.value)
            }
            placeholder="Salary expectation"
          />

          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Adding..."
              : "Add application"}
          </button>
        </form>
      )}

      {mode === "json" && (
        <div>
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

          {jsonError && <p>{jsonError}</p>}

          <button
            type="button"
            onClick={handleJsonSubmit}
            disabled={!jsonInput.trim() || mutation.isPending}
          >
            Import applications
          </button>
        </div>
      )}
    </section>
  );
}