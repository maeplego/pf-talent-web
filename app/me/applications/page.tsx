import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { AppShell, LoginGate } from "../../components/AppShell";
import { InterviewSlots } from "../../components/InterviewSlots";
import { talentFetch } from "../../lib/api";
import { parseDevSession, sessionQuery } from "../../lib/session";
import type { Application, Job } from "../../lib/types";

export default async function MyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; role?: string; error?: string }>;
}) {
  noStore();
  const sp = await searchParams;
  const session = parseDevSession(sp);
  if (!session) {
    return <LoginGate />;
  }

  const result = await talentFetch<Application[]>(`/v1/candidates/${session.sub}/applications`, session);
  const rows = result.ok ? result.data : [];
  const jobs = new Map<string, Job>();
  if (result.ok) {
    for (const row of rows) {
      if (jobs.has(row.jobId)) continue;
      const job = await talentFetch<Job>(`/v1/jobs/${row.jobId}`, session);
      if (job.ok) jobs.set(row.jobId, job.data);
    }
  }

  return (
    <AppShell session={session}>
      <main>
        <h1>マイ応募</h1>
        <p>候補者から見た応募。企業画面とは項目が違う。他候補者の sub では API が 403 を返す。</p>
        {sp.error ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {sp.error}
          </p>
        ) : null}
        {!result.ok ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {result.error}
          </p>
        ) : rows.length === 0 ? (
          <p>まだ応募がありません。</p>
        ) : (
          <ul>
            {rows.map((row) => (
              <li key={row.id}>
                <Link href={`/jobs/${row.jobId}${sessionQuery(session)}`}>
                  {jobs.get(row.jobId)?.title ?? row.jobId}
                </Link>
                {" — "}
                ステータス <code>{row.status}</code>
                {(row.status === "document_passed" || row.status === "interview") ? (
                  <InterviewSlots applicationId={row.id} session={session} />
                ) : null}
                <div style={{ fontSize: "0.85rem", color: "#555" }}>履歴書スナップショット（先頭）: {row.resumeSnapshot.slice(0, 80)}</div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
