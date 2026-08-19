"use server";

import { redirect } from "next/navigation";

import { talentFetch } from "./lib/api";
import { parseDevSession, sessionQuery } from "./lib/session";

function sessionFromForm(formData: FormData) {
  return parseDevSession({
    user: String(formData.get("user") ?? ""),
    role: String(formData.get("role") ?? ""),
  });
}

function fail(path: string, session: NonNullable<ReturnType<typeof parseDevSession>>, error: string) {
  redirect(`${path}${sessionQuery(session, { error })}`);
}

export async function applyToJob(formData: FormData) {
  const session = sessionFromForm(formData);
  if (!session) redirect("/");
  const jobId = String(formData.get("jobId") ?? "");
  const resumeSnapshot = String(formData.get("resumeSnapshot") ?? "").trim();
  const result = await talentFetch(`/v1/jobs/${jobId}/applications`, session, {
    method: "POST",
    body: JSON.stringify({ candidateSub: session.sub, resumeSnapshot }),
  });
  if (!result.ok) {
    fail(`/jobs/${jobId}`, session, result.error);
  }
  redirect(`/me/applications${sessionQuery(session)}`);
}

export async function reportJob(formData: FormData) {
  const session = sessionFromForm(formData);
  if (!session) redirect("/");
  const jobId = String(formData.get("jobId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const result = await talentFetch(`/v1/reports`, session, {
    method: "POST",
    body: JSON.stringify({ reporterSub: session.sub, jobId, reason }),
  });
  if (!result.ok) {
    fail(`/jobs/${jobId}`, session, result.error);
  }
  redirect(`/jobs/${jobId}${sessionQuery(session, { reported: "1" })}`);
}

export async function saveProfile(formData: FormData) {
  const session = sessionFromForm(formData);
  if (!session) redirect("/");
  const skills = String(formData.get("skills") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const desiredMinSalaryRaw = String(formData.get("desiredMinSalary") ?? "").trim();
  const result = await talentFetch(`/v1/profiles/${session.sub}`, session, {
    method: "PUT",
    body: JSON.stringify({
      sub: session.sub,
      displayName: String(formData.get("displayName") ?? "").trim() || session.sub,
      skills,
      desiredEmploymentTypes: [String(formData.get("desiredEmploymentType") ?? "full_time")],
      desiredMinSalary: desiredMinSalaryRaw ? Number(desiredMinSalaryRaw) : null,
      desiredRemote: formData.get("desiredRemote") === "true",
      bio: String(formData.get("bio") ?? ""),
    }),
  });
  if (!result.ok) {
    fail("/me/profile", session, result.error);
  }
  redirect(`/me/profile${sessionQuery(session, { saved: "1" })}`);
}

export async function createJob(formData: FormData) {
  const session = sessionFromForm(formData);
  if (!session) redirect("/");
  const salaryMinRaw = String(formData.get("salaryMin") ?? "").trim();
  const salaryMaxRaw = String(formData.get("salaryMax") ?? "").trim();
  const skills = String(formData.get("skills") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const result = await talentFetch(`/v1/jobs`, session, {
    method: "POST",
    body: JSON.stringify({
      employerSub: session.sub,
      title: String(formData.get("title") ?? "").trim(),
      status: formData.get("status") === "published" ? "published" : "draft",
      employmentType: String(formData.get("employmentType") ?? "full_time"),
      location: String(formData.get("location") ?? ""),
      remote: formData.get("remote") === "true",
      salaryMin: salaryMinRaw ? Number(salaryMinRaw) : null,
      salaryMax: salaryMaxRaw ? Number(salaryMaxRaw) : null,
      skills,
      description: String(formData.get("description") ?? ""),
    }),
  });
  if (!result.ok) {
    fail("/employer/jobs/new", session, result.error);
  }
  redirect(`/employer/jobs${sessionQuery(session)}`);
}

export async function patchApplicationStatus(formData: FormData) {
  const session = sessionFromForm(formData);
  if (!session) redirect("/");
  const jobId = String(formData.get("jobId") ?? "");
  const applicationId = String(formData.get("applicationId") ?? "");
  const status = String(formData.get("status") ?? "");
  const result = await talentFetch(`/v1/applications/${applicationId}/status`, session, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!result.ok) {
    fail(`/employer/jobs/${jobId}/applications`, session, result.error);
  }
  redirect(`/employer/jobs/${jobId}/applications${sessionQuery(session)}`);
}
