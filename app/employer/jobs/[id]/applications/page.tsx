import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { patchApplicationStatus } from "@/app/actions";
import { AppShell, LoginGate } from "@/components/AppShell";
import { InterviewSlots } from "@/components/InterviewSlots";
import { talentFetch } from "@/lib/api";
import { loadTalentSession, sessionQuery } from "@/lib/session";
import type { Application, Job } from "@/lib/types";

const NEXT_STATUSES = ["applied", "document_passed", "interview", "offered", "rejected"] as const;

export default async function ApplicantListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ user?: string; role?: string; error?: string }>;
}) {
  noStore();
  const { id } = await params;
  const sp = await searchParams;
  const session = await loadTalentSession(sp);
  if (!session) {
    return <LoginGate />;
  }

  const jobResult = await talentFetch<Job>(`/v1/jobs/${id}`, session);
  const appsResult = await talentFetch<Application[]>(`/v1/jobs/${id}/applications`, session);

  return (
    <AppShell session={session}>
      <main>
        <p>
          <Link href={`/employer/jobs${sessionQuery(session)}`}>← 求人管理</Link>
        </p>
        <h1>応募者一覧</h1>
        <p>企業から見た応募。候補者のマイ応募とは履歴書と操作が違う。他社ヘッダは 403。</p>
        {jobResult.ok ? <p>求人: {jobResult.data.title}</p> : null}
        {sp.error ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {sp.error}
          </p>
        ) : null}
        {!appsResult.ok ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {appsResult.status === 403 ? "他社の応募は見られません（403）" : appsResult.error}
          </p>
        ) : appsResult.data.length === 0 ? (
          <p>応募はまだありません。</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {appsResult.data.map((row) => (
              <li key={row.id} style={{ borderBottom: "1px solid #eee", padding: "0.75rem 0" }}>
                <div>
                  候補者 <code>{row.candidateSub}</code> · ステータス <code>{row.status}</code>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", background: "#f7f7f7", padding: "0.5rem" }}>
                  {row.resumeSnapshot}
                </pre>
                <form action={patchApplicationStatus}>
                  <input type="hidden" name="user" value={session.sub} />
                  <input type="hidden" name="role" value={session.role} />
                  <input type="hidden" name="jobId" value={id} />
                  <input type="hidden" name="applicationId" value={row.id} />
                  <select name="status" defaultValue="">
                    <option value="" disabled>
                      遷移先
                    </option>
                    {NEXT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>{" "}
                  <button type="submit">更新</button>
                </form>
                {row.status === "document_passed" || row.status === "interview" ? (
                  <InterviewSlots applicationId={row.id} session={session} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
