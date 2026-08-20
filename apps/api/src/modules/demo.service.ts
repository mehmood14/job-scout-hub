import type { ApplicationStatus } from "@job-scout/shared";
import { prisma } from "../shared/prisma.js";

type DemoTimelineEvent = {
  status: ApplicationStatus;
  occurredAt: Date;
};

type DemoApplication = {
  company: string;
  role: string;
  status: ApplicationStatus;
  recruiterName: string;
  salaryExpectation: string;
  appliedDate: Date;
  timelineOrder: ApplicationStatus[];
  timelineSkippedStatuses?: ApplicationStatus[];
  timelineEvents: DemoTimelineEvent[];
};

const date = (value: string): Date => new Date(value);

const demoApplications: DemoApplication[] = [
  {
    company: "Spotify",
    role: "Frontend Engineer",
    status: "Technical Interview",
    recruiterName: "Avery Lind",
    salaryExpectation: "62,000–70,000 SEK",
    appliedDate: date("2026-08-12T08:30:00.000Z"),
    timelineOrder: ["Applied", "Recruiter Contacted", "Interview", "Technical Interview", "Test Assignment", "Offer"],
    timelineSkippedStatuses: ["EM Interview", "VP/CTO Interview", "Cultural Interview"],
    timelineEvents: [
      { status: "Applied", occurredAt: date("2026-08-12T08:30:00.000Z") },
      { status: "Recruiter Contacted", occurredAt: date("2026-08-14T12:15:00.000Z") },
      { status: "Interview", occurredAt: date("2026-08-18T07:00:00.000Z") },
      { status: "Technical Interview", occurredAt: date("2026-08-24T11:00:00.000Z") },
    ],
  },
  {
    company: "Northstar",
    role: "Product Engineer",
    status: "Interview",
    recruiterName: "Maya Berg",
    salaryExpectation: "58,000–65,000 SEK",
    appliedDate: date("2026-08-09T09:20:00.000Z"),
    timelineOrder: ["Applied", "Recruiter Contacted", "Interview", "Cultural Interview", "Offer"],
    timelineSkippedStatuses: ["Technical Interview", "Test Assignment", "EM Interview", "VP/CTO Interview"],
    timelineEvents: [
      { status: "Applied", occurredAt: date("2026-08-09T09:20:00.000Z") },
      { status: "Recruiter Contacted", occurredAt: date("2026-08-11T13:40:00.000Z") },
      { status: "Interview", occurredAt: date("2026-08-19T09:30:00.000Z") },
    ],
  },
  {
    company: "Cedar Labs",
    role: "Software Engineer",
    status: "Offer",
    recruiterName: "Noah Anders",
    salaryExpectation: "60,000 SEK",
    appliedDate: date("2026-07-21T07:45:00.000Z"),
    timelineOrder: ["Applied", "Recruiter Contacted", "Interview", "Test Assignment", "Offer"],
    timelineSkippedStatuses: ["Technical Interview", "EM Interview", "VP/CTO Interview", "Cultural Interview"],
    timelineEvents: [
      { status: "Applied", occurredAt: date("2026-07-21T07:45:00.000Z") },
      { status: "Recruiter Contacted", occurredAt: date("2026-07-23T10:00:00.000Z") },
      { status: "Interview", occurredAt: date("2026-07-29T08:00:00.000Z") },
      { status: "Test Assignment", occurredAt: date("2026-08-03T14:30:00.000Z") },
      { status: "Offer", occurredAt: date("2026-08-10T09:15:00.000Z") },
    ],
  },
  {
    company: "Horizon Works",
    role: "Frontend Developer",
    status: "Recruiter Contacted",
    recruiterName: "Elliot Stone",
    salaryExpectation: "55,000–60,000 SEK",
    appliedDate: date("2026-08-16T08:00:00.000Z"),
    timelineOrder: ["Applied", "Recruiter Contacted", "Interview", "Technical Interview", "Offer"],
    timelineSkippedStatuses: ["Test Assignment", "EM Interview", "VP/CTO Interview", "Cultural Interview"],
    timelineEvents: [
      { status: "Applied", occurredAt: date("2026-08-16T08:00:00.000Z") },
      { status: "Recruiter Contacted", occurredAt: date("2026-08-17T11:45:00.000Z") },
    ],
  },
  {
    company: "Lumen Studio",
    role: "UI Engineer",
    status: "Parked",
    recruiterName: "Sofia Nilsson",
    salaryExpectation: "57,000 SEK",
    appliedDate: date("2026-07-28T10:10:00.000Z"),
    timelineOrder: ["Applied", "Recruiter Contacted", "Interview", "Parked"],
    timelineSkippedStatuses: ["Technical Interview", "Test Assignment", "EM Interview", "VP/CTO Interview", "Cultural Interview", "Offer"],
    timelineEvents: [
      { status: "Applied", occurredAt: date("2026-07-28T10:10:00.000Z") },
      { status: "Recruiter Contacted", occurredAt: date("2026-07-30T14:00:00.000Z") },
      { status: "Interview", occurredAt: date("2026-08-05T09:00:00.000Z") },
      { status: "Parked", occurredAt: date("2026-08-08T12:30:00.000Z") },
    ],
  },
  {
    company: "Atlas Cloud",
    role: "Full-stack Engineer",
    status: "Rejected",
    recruiterName: "Leo Hansen",
    salaryExpectation: "59,000–66,000 SEK",
    appliedDate: date("2026-07-15T08:15:00.000Z"),
    timelineOrder: ["Applied", "Recruiter Contacted", "Technical Interview", "Rejected"],
    timelineSkippedStatuses: ["Interview", "Test Assignment", "EM Interview", "VP/CTO Interview", "Cultural Interview", "Offer", "Parked"],
    timelineEvents: [
      { status: "Applied", occurredAt: date("2026-07-15T08:15:00.000Z") },
      { status: "Recruiter Contacted", occurredAt: date("2026-07-17T15:00:00.000Z") },
      { status: "Technical Interview", occurredAt: date("2026-07-24T08:30:00.000Z") },
      { status: "Rejected", occurredAt: date("2026-07-28T10:45:00.000Z") },
    ],
  },
];

export async function ensureDemoApplications(): Promise<void> {
  const existingDemoApplications = await prisma.application.count({
    where: { accessMode: "viewer" },
  });

  if (existingDemoApplications > 0) {
    return;
  }

  await prisma.$transaction(
    demoApplications.map((application) =>
      prisma.application.create({
        data: {
          company: application.company,
          role: application.role,
          status: application.status,
          recruiterName: application.recruiterName,
          salaryExpectation: application.salaryExpectation,
          appliedDate: application.appliedDate,
          accessMode: "viewer",
          timelineOrder: application.timelineOrder,
          timelineSkippedStatuses: application.timelineSkippedStatuses ?? [],
          timelineEvents: { create: application.timelineEvents },
        },
      }),
    ),
  );
}
