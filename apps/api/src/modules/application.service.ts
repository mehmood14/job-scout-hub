import type {
  CreateApplicationInput,
  UpdateApplicationInput,
} from "./application.schema.js";
import { prisma } from "../shared/prisma.js";

export const getApplications = async () => {
  return prisma.application.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createApplication = async (
  input: CreateApplicationInput,
) => {
  const data = {
    company: input.company,
    role: input.role,
    status: input.status,
    ...(input.salaryExpectation !== undefined
      ? { salaryExpectation: input.salaryExpectation }
      : {}),
  };

  return prisma.application.create({
    data,
  });
};

export const deleteApplication = async (id: string) => {
  return prisma.application.delete({
    where: { id },
  });
};

export const updateApplication = async (
  id: string,
  input: UpdateApplicationInput,
) => {
  const data = {
    ...(input.company !== undefined
      ? { company: input.company }
      : {}),
    ...(input.role !== undefined
      ? { role: input.role }
      : {}),
    ...(input.status !== undefined
      ? { status: input.status }
      : {}),
    ...(input.salaryExpectation !== undefined
      ? { salaryExpectation: input.salaryExpectation }
      : {}),
  };

  return prisma.application.update({
    where: { id },
    data,
  });
};

export const createApplicationsBulk = async (
  applications: CreateApplicationInput[],
) => {
  return prisma.$transaction(
    applications.map((application) => {
      const data = {
        company: application.company,
        role: application.role,
        status: application.status,
        ...(application.salaryExpectation !== undefined
          ? {
              salaryExpectation:
                application.salaryExpectation,
            }
          : {}),
      };

      return prisma.application.upsert({
        where: {
          company_role: {
            company: application.company,
            role: application.role,
          },
        },
        update: data,
        create: data,
      });
    }),
  );
};