import type { DevSession } from "./session";
import { oidcEnabled } from "./oidc/env";
import { readCookie } from "./oidc/cookies";

export class TalentApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function talentApiBase(): string {
  return (process.env.TALENT_API_URL ?? "http://localhost:8090").replace(/\/$/, "");
}

export type TalentResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export async function talentFetch<T>(path: string, session: DevSession, init?: RequestInit): Promise<TalentResult<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Dev-User-Sub": session.sub,
    };
    if (oidcEnabled()) {
      const access = await readCookie("rp_access");
      if (access) {
        headers.Authorization = `Bearer ${access}`;
      }
    }
    const res = await fetch(`${talentApiBase()}${path}`, {
      ...init,
      headers: {
        ...headers,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, error: parseErrorMessage(text, res.statusText), status: res.status };
    }
    return { ok: true, data: text ? (JSON.parse(text) as T) : ({} as T) };
  } catch {
    return { ok: false, error: "talent API に接続できません", status: 503 };
  }
}

function parseErrorMessage(text: string, fallback: string): string {
  try {
    const body = JSON.parse(text) as { error?: { message?: string; code?: string } };
    if (body.error?.message) {
      return body.error.message;
    }
    if (body.error?.code) {
      return body.error.code;
    }
  } catch {
    // raw text
  }
  return text || fallback;
}

export type JobSearchFilters = {
  q?: string;
  employmentType?: string;
  remote?: string;
  skills?: string;
  salaryMin?: string;
  salaryMax?: string;
};

export function buildJobsQuery(filters: JobSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.employmentType) params.set("employmentType", filters.employmentType);
  if (filters.remote) params.set("remote", filters.remote);
  if (filters.skills) params.set("skills", filters.skills);
  if (filters.salaryMin) params.set("salaryMin", filters.salaryMin);
  if (filters.salaryMax) params.set("salaryMax", filters.salaryMax);
  return params.toString();
}
