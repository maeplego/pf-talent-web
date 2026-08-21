import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { AppShell, LoginGate } from "@/components/AppShell";
import { talentFetch } from "@/lib/api";
import { loadTalentSession, sessionQuery } from "@/lib/session";
import type { Job } from "@/lib/types";

export default async function EmployerJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; role?: string; error?: string }>;
}) {
  noStore();
  const sp = await searchParams;
  const session = await loadTalentSession(sp);
  if (!session) {
    return <LoginGate />;
  }

  const result = await talentFetch<Job[]>(`/v1/employers/${session.sub}/jobs`, session);

  return (
    <AppShell session={session}>
      <main>
        <h1>求人管理</h1>
        <p>
          <Link href={`/employer/jobs/new${sessionQuery(session)}`}>求人を作成</Link>
        </p>
        {sp.error ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {sp.error}
          </p>
        ) : null}
        {!result.ok ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {result.error}
          </p>
        ) : result.data.length === 0 ? (
          <p>まだ求人がありません。</p>
        ) : (
          <ul>
            {result.data.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.id}${sessionQuery(session)}`}>{job.title}</Link>{" "}
                <code>{job.status}</code>{" "}
                <Link href={`/employer/jobs/${job.id}/applications${sessionQuery(session)}`}>応募者</Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
