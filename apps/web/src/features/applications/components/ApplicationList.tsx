import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getApplications,
  type Application,
} from "../api/getApplications";
import { deleteApplication } from "../api/deleteApplication";
import { updateApplication } from "../api/updateApplication";

type ApplicationListProps = {
  filters: {
    search: string;
    status: string;
    sortBy: string;
  };
};

export function ApplicationList({ filters }: ApplicationListProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    data: applications = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

const filteredApplications = useMemo(() => {
  const search = filters.search.trim().toLowerCase();

  const result = applications.filter((application) => {
    const matchesSearch =
      !search ||
      application.company.toLowerCase().includes(search) ||
      application.role.toLowerCase().includes(search);

    const matchesStatus =
      filters.status === "All" ||
      application.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  if (filters.sortBy === "status") {
    const statusOrder: Record<string, number> = {
      Offer: 0,
      "Technical Interview": 1,
      Interview: 2,
      "Recruiter Contacted": 3,
      Applied: 4,
      Rejected: 5,
    };

    return result.toSorted(
      (a, b) =>
        (statusOrder[a.status] ?? 99) -
        (statusOrder[b.status] ?? 99),
    );
  }

  return result;
}, [applications, filters]);

  const updateMutation = useMutation({
    mutationFn: updateApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ["applications"],
      });

      const previousApplications =
        queryClient.getQueryData<Application[]>(["applications"]);

      queryClient.setQueryData<Application[]>(
        ["applications"],
        (current = []) =>
          current.filter((application) => application.id !== id),
      );

      return { previousApplications };
    },

    onError: (_error, _id, context) => {
      queryClient.setQueryData(
        ["applications"],
        context?.previousApplications,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    },
  });

  if (isPending) {
    return <p>Loading applications...</p>;
  }

  if (isError) {
    return <p>Could not load applications.</p>;
  }

  return (
  <>

    <p>

      {filteredApplications.length === applications.length

        ? `${applications.length} applications`

        : `${filteredApplications.length} of ${applications.length} applications`}

    </p>
    
    <table>
      <thead>
        <tr>
          <th>Company</th>
          <th>Role</th>
          <th>Status</th>
          <th>Salary expectation</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {filteredApplications.map((application) => {
          const isEditing = editingId === application.id;

          return (
            <tr key={application.id}>
              <td>
                {isEditing ? (
                  <input
                    defaultValue={application.company}
                    onBlur={(event) =>
                      updateMutation.mutate({
                        id: application.id,
                        company: event.target.value,
                      })
                    }
                  />
                ) : (
                  application.company
                )}
              </td>

              <td>
                {isEditing ? (
                  <input
                    defaultValue={application.role}
                    onBlur={(event) =>
                      updateMutation.mutate({
                        id: application.id,
                        role: event.target.value,
                      })
                    }
                  />
                ) : (
                  application.role
                )}
              </td>

              <td>
                <select
                  value={application.status}
                  onChange={(event) =>
                    updateMutation.mutate({
                      id: application.id,
                      status: event.target.value,
                    })
                  }
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
              </td>

              <td>
                {isEditing ? (
                  <input
                    defaultValue={application.salaryExpectation ?? ""}
                    placeholder="65 000 SEK/mo"
                    onBlur={(event) =>
                      updateMutation.mutate({
                        id: application.id,
                        salaryExpectation:
                          event.target.value || null,
                      })
                    }
                  />
                ) : (
                  application.salaryExpectation ?? "—"
                )}
              </td>

              <td>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                  >
                    Done
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingId(application.id)}
                  >
                    Edit
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    deleteMutation.mutate(application.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}

        {filteredApplications.length === 0 && (
          <tr>
            <td colSpan={5}>No applications found.</td>
          </tr>
        )}
      </tbody>
    </table>

    </>
  );
}