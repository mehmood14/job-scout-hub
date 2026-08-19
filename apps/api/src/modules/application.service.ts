import type { CreateApplicationInput, UpdateApplicationInput } from "./application.schema.js";
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
  return prisma.application.create({
    data: input,
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

  return prisma.application.update({

    where: { id },

    data: input,

  });

};

export const createApplicationsBulk = async (
  applications: CreateApplicationInput[],
) => {
  return prisma.$transaction(
    applications.map((application) =>
      prisma.application.upsert({
        where: {
          company_role: {
            company: application.company,
            role: application.role,
          },
        },
        update: {},
        create: application,
      }),
    ),
  );
};