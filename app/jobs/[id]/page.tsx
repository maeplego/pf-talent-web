import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

import { applyToJob, reportJob } from "../../actions";
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
  searchParams: Promise<{ user?: string; role?: string; error?: string; reported?: string }>;
}) {
  noStore();
  const { id } = await params;
  const sp = await searchParams;
  const session = parseDevSession(sp);
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
        {sp.error ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {sp.error}
          </p>
        ) : null}
        {sp.reported ? <p>通報を受け付けました。</p> : null}
        <h1>{job.title}</h1>
        <p>
          {job.employmentType} · {job.remote ? "remote" : "office"} · {job.location || "—"} · {salaryLabel(job)}
        </p>
        <p>{job.skills.join(", ")}</p>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", background: "#f7f7f7", padding: "1rem" }}>
          {job.description || "（本文なし）"}
        </pre>

        {session.role === "candidate" || session.role === "admin" ? (
          <section>
            <h2>応募</h2>
            <form action={applyToJob}>
              <input type="hidden" name="user" value={session.sub} />
              <input type="hidden" name="role" value={session.role} />
              <input type="hidden" name="jobId" value={job.id} />
              <p>
                <textarea name="resumeSnapshot" required rows={6} cols={60} placeholder="履歴書テキスト" />
              </p>
              <button type="submit">応募する</button>
            </form>
          </section>
        ) : null}

        {session.role === "employer" ? (
          <p>
            <Link href={`/employer/jobs/${job.id}/applications${sessionQuery(session)}`}>応募者一覧</Link>
          </p>
        ) : null}

        <section>
          <h2>通報</h2>
          <form action={reportJob}>
            <input type="hidden" name="user" value={session.sub} />
            <input type="hidden" name="role" value={session.role} />
            <input type="hidden" name="jobId" value={job.id} />
            <p>
              <input name="reason" required placeholder="理由" />
            </p>
            <button type="submit">通報する</button>
          </form>
        </section>

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
