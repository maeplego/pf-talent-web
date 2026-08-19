import { unstable_noStore as noStore } from "next/cache";

import { AppShell, LoginGate } from "../../components/AppShell";
import { talentFetch } from "../../lib/api";
import { parseDevSession } from "../../lib/session";
import type { Report } from "../../lib/types";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; role?: string }>;
}) {
  noStore();
  const session = parseDevSession(await searchParams);
  if (!session) {
    return <LoginGate />;
  }

  const result = await talentFetch<{ reports: Report[] }>("/v1/reports", session);

  return (
    <AppShell session={session}>
      <main>
        <h1>通報一覧</h1>
        {!result.ok ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {result.error}
          </p>
        ) : result.data.reports.length === 0 ? (
          <p>オープンな通報はありません。</p>
        ) : (
          <ul>
            {result.data.reports.map((row) => (
              <li key={row.id}>
                job <code>{row.jobId}</code> · {row.reason} · {row.status} · reporter {row.reporterSub}
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
