import { unstable_noStore as noStore } from "next/cache";

import { runSavedSearch, saveSearch } from "@/app/actions";
import { AppShell, LoginGate } from "@/components/AppShell";
import { talentFetch } from "@/lib/api";
import { parseDevSession } from "@/lib/session";
import type { SavedSearch } from "@/lib/types";

export default async function SavedSearchesPage({
  searchParams,
}: {
  searchParams: Promise<{
    user?: string;
    role?: string;
    error?: string;
    ran?: string;
    q?: string;
    employmentType?: string;
    remote?: string;
    skills?: string;
    salaryMin?: string;
    salaryMax?: string;
  }>;
}) {
  noStore();
  const sp = await searchParams;
  const session = parseDevSession(sp);
  if (!session) {
    return <LoginGate />;
  }

  const result = await talentFetch<SavedSearch[]>(`/v1/candidates/${session.sub}/saved-searches`, session);

  return (
    <AppShell session={session}>
      <main>
        <h1>保存検索</h1>
        <p>条件を保存し、run で今の published 求人に対する新着件数を見る。通知メールは出さない。</p>
        {sp.error ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {sp.error}
          </p>
        ) : null}
        {sp.ran ? <p>run 結果: {sp.ran} 件マッチ</p> : null}

        <h2>作成</h2>
        <form action={saveSearch} style={{ display: "grid", gap: "0.5rem", maxWidth: 480 }}>
          <input type="hidden" name="user" value={session.sub} />
          <input type="hidden" name="role" value={session.role} />
          <label>
            名前 <input name="name" required defaultValue="保存した検索" />
          </label>
          <label>
            キーワード <input name="q" defaultValue={sp.q ?? ""} />
          </label>
          <label>
            雇用形態 <input name="employmentType" defaultValue={sp.employmentType ?? ""} />
          </label>
          <label>
            リモート <input name="remote" defaultValue={sp.remote ?? ""} placeholder="true / false" />
          </label>
          <label>
            スキル <input name="skills" defaultValue={sp.skills ?? ""} />
          </label>
          <label>
            年収下限 <input name="salaryMin" defaultValue={sp.salaryMin ?? ""} />
          </label>
          <label>
            年収上限 <input name="salaryMax" defaultValue={sp.salaryMax ?? ""} />
          </label>
          <button type="submit">保存</button>
        </form>

        <h2>一覧</h2>
        {!result.ok ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {result.error}
          </p>
        ) : result.data.length === 0 ? (
          <p>まだありません。</p>
        ) : (
          <ul>
            {result.data.map((row) => (
              <li key={row.id} style={{ marginBottom: "0.75rem" }}>
                <strong>{row.name}</strong> — q={row.query || "—"} skills={row.skills.join(",") || "—"} lastRunAt=
                {row.lastRunAt ?? "未実行"}
                <form action={runSavedSearch} style={{ display: "inline", marginLeft: "0.5rem" }}>
                  <input type="hidden" name="user" value={session.sub} />
                  <input type="hidden" name="role" value={session.role} />
                  <input type="hidden" name="savedSearchId" value={row.id} />
                  <button type="submit">run</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
