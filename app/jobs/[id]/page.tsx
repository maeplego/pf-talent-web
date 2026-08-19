import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

import { AppShell, LoginGate } from "../../components/AppShell";
import { talentFetch } from "../../lib/api";
import { parseDevSession, sessionQuery } from "../../lib/session";
import type { Job, SimilarJobs } from "../../lib/types";

function salaryLabel(job: Job): string {
  if (job.salaryMin === null && job.salaryMax === null) {
    return "応相談";
  }
  const min = job.salaryMin !== null ? `${job.salaryMin.toLocaleString()}円` : "?";
  const max = job.salaryMax !== null ? `${job.salaryMax.toLocaleString()}円` : "?";
  return `${min}〜${max}`;
}

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ user?: string; role?: string }>;
}) {
  noStore();
  const { id } = await params;
  const session = parseDevSession(await searchParams);
  if (!session) {
    return <LoginGate />;
  }

  const jobResult = await talentFetch<Job>(`/v1/jobs/${id}`, session);
  if (!jobResult.ok && jobResult.status === 404) {
    notFound();
  }
  if (!jobResult.ok) {
    return (
      <AppShell session={session}>
        <main>
          <p role="alert" style={{ color: "#b00020" }}>
            {jobResult.error}
          </p>
        </main>
      </AppShell>
    );
  }

  const job = jobResult.data;
  const similarResult = await talentFetch<SimilarJobs>(`/v1/jobs/${id}/similar?k=5`, session);

  return (
    <AppShell session={session}>
      <main>
        <p>
          <Link href={`/${sessionQuery(session)}`}>← 検索</Link>
        </p>
        <h1>{job.title}</h1>
        <p>
          {job.employmentType} · {job.remote ? "remote" : "office"} · {job.location || "—"} · {salaryLabel(job)}
        </p>
        <p>{job.skills.join(", ")}</p>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", background: "#f7f7f7", padding: "1rem" }}>
          {job.description || "（本文なし）"}
        </pre>

        <h2>類似求人</h2>
        {!similarResult.ok ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {similarResult.error}
          </p>
        ) : (
          <>
            <p>
              source: <code>{similarResult.data.source}</code>
            </p>
            {similarResult.data.jobs.length === 0 ? (
              <p>類似求人はありません。</p>
            ) : (
              <ul>
                {similarResult.data.jobs.map((row) => (
                  <li key={row.id}>
                    <Link href={`/jobs/${row.id}${sessionQuery(session)}`}>{row.title}</Link>{" "}
                    <span style={{ fontSize: "0.8rem", background: "#eee", padding: "0.1rem 0.4rem" }}>
                      {similarResult.data.source}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </AppShell>
  );
}
