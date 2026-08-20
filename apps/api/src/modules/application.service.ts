import type {
  CreateApplicationInput,
  UpdateApplicationInput,
  UpdateTimelineOrderInput,
  UpsertTimelineEventInput,
  UpdateTimelineSkippedStatusesInput,
} from "./application.schema.js";
import { prisma } from "../shared/prisma.js";
import type { AccessMode } from "@job-scout/shared";

export const getApplications = async (accessMode: AccessMode) => {
  const applications = await prisma.application.findMany({
    where: { accessMode },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      timelineEvents: {
        select: {
          status: true,
          occurredAt: true,
        },
        orderBy: { occurredAt: "desc" },
      },
    },
  });

  return applications.map(({ timelineEvents, ...application }) => ({
    ...application,
    currentStatusOccurredAt:
      timelineEvents.find((event) => event.status === application.status)
        ?.occurredAt ?? null,
  }));
};

export const getApplicationTimeline = async (
  id: string,
  accessMode: AccessMode,
) => {
  const application = await prisma.application.findFirst({
    where: { id, accessMode },
    select: {
      timelineOrder: true,
      timelineSkippedStatuses: true,
      timelineEvents: {
        orderBy: { occurredAt: "asc" },
      },
    },
  });

  if (!application) {
    return undefined;
  }

  return {
    events: application.timelineEvents,
    statusOrder: application.timelineOrder,
    skippedStatuses: application.timelineSkippedStatuses,
  };
};

export const updateApplicationTimelineOrder = async (
  id: string,
  input: UpdateTimelineOrderInput,
  accessMode: AccessMode,
) => {
  return prisma.application.update({
    where: { id, accessMode },
    data: { timelineOrder: input.statusOrder },
  });
};

export const updateApplicationTimelineSkippedStatuses = async (
  id: string,
  input: UpdateTimelineSkippedStatusesInput,
  accessMode: AccessMode,
) => {
  return prisma.application.update({
    where: { id, accessMode },
    data: { timelineSkippedStatuses: input.skippedStatuses },
  });
};

export const upsertApplicationTimelineEvent = async (
  id: string,
  input: UpsertTimelineEventInput,
  accessMode: AccessMode,
) => {
  return prisma.$transaction(async (transaction) => {
    const application = await transaction.application.findFirst({
      where: { id, accessMode },
      select: { id: true },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    const existingEvent = await transaction.applicationTimelineEvent.findFirst({
      where: { applicationId: id, status: input.status },
      orderBy: { occurredAt: "desc" },
    });

    const event = existingEvent
      ? await transaction.applicationTimelineEvent.update({
        where: { id: existingEvent.id },
        data: { occurredAt: input.occurredAt },
      })
      : await transaction.applicationTimelineEvent.create({
        data: {
          applicationId: id,
          status: input.status,
          occurredAt: input.occurredAt,
        },
      });

    if (input.status === "Applied") {
      await transaction.application.update({
        where: { id, accessMode },
        data: { appliedDate: input.occurredAt },
      });
    }

    return event;
  });
};

export const createApplication = async (
  input: CreateApplicationInput,
  accessMode: AccessMode,
) => {
  const data = {
    company: input.company,
    role: input.role,
    status: input.status,
    appliedDate: input.appliedDate ?? new Date(),
    ...(input.recruiterName !== undefined
      ? { recruiterName: input.recruiterName }
      : {}),
    ...(input.salaryExpectation !== undefined
      ? { salaryExpectation: input.salaryExpectation }
      : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    accessMode,
  };

  return prisma.application.create({
    data: {
      ...data,
      timelineEvents: {
        create: {
          status: input.status,
          occurredAt: data.appliedDate,
        },
      },
    },
  });
};

export const deleteApplication = async (id: string, accessMode: AccessMode) => {
  return prisma.application.delete({
    where: { id, accessMode },
  });
};

export const updateApplication = async (
  id: string,
  input: UpdateApplicationInput,
  accessMode: AccessMode,
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
    ...(input.appliedDate !== undefined
      ? { appliedDate: input.appliedDate }
      : {}),
    ...(input.recruiterName !== undefined
      ? { recruiterName: input.recruiterName }
      : {}),
    ...(input.salaryExpectation !== undefined
      ? { salaryExpectation: input.salaryExpectation }
      : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
  };

  return prisma.$transaction(async (transaction) => {
    const currentApplication = await transaction.application.findFirst({
      where: { id, accessMode },
      select: { status: true },
    });

    if (!currentApplication) {
      throw new Error("Application not found");
    }

    const application = await transaction.application.update({
      where: { id, accessMode },
      data,
    });

    let appliedTimelineWasSynced = false;
    if (input.appliedDate !== undefined) {
      const appliedEvent = await transaction.applicationTimelineEvent.findFirst({
        where: { applicationId: id, status: "Applied" },
        orderBy: { occurredAt: "asc" },
      });

      if (appliedEvent) {
        await transaction.applicationTimelineEvent.update({
          where: { id: appliedEvent.id },
          data: { occurredAt: input.appliedDate },
        });
      } else {
        await transaction.applicationTimelineEvent.create({
          data: {
            applicationId: id,
            status: "Applied",
            occurredAt: input.appliedDate,
          },
        });
      }

      appliedTimelineWasSynced = true;
    }

    if (
      input.status !== undefined &&
      input.status !== currentApplication.status &&
      !(input.status === "Applied" && appliedTimelineWasSynced)
    ) {
      await transaction.applicationTimelineEvent.create({
        data: {
          applicationId: id,
          status: input.status,
        },
      });
    }

    return application;
  });
};

export const createApplicationsBulk = async (
  applications: CreateApplicationInput[],
  accessMode: AccessMode,
) => {
  return prisma.$transaction(
    applications.map((application) => {
      const data = {
        company: application.company,
        role: application.role,
        status: application.status,
        appliedDate: application.appliedDate ?? new Date(),
        ...(application.recruiterName !== undefined
          ? { recruiterName: application.recruiterName }
          : {}),
        ...(application.salaryExpectation !== undefined
          ? {
              salaryExpectation:
                application.salaryExpectation,
            }
          : {}),
        ...(application.description !== undefined
          ? { description: application.description }
          : {}),
        accessMode,
      };

      return prisma.application.upsert({
        where: {
          company_role_accessMode: {
            company: application.company,
            role: application.role,
            accessMode,
          },
        },
        update: data,
        create: {
          ...data,
          timelineEvents: {
            create: {
              status: application.status,
              occurredAt: data.appliedDate,
            },
          },
        },
      });
    }),
  );
};
