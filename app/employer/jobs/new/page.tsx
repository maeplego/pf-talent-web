import { unstable_noStore as noStore } from "next/cache";

import { createJob } from "@/app/actions";
import { AppShell, LoginGate } from "@/components/AppShell";
import { parseDevSession } from "@/lib/session";

export default async function NewJobPage({
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

  return (
    <AppShell session={session}>
      <main>
        <h1>求人作成</h1>
        {sp.error ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {sp.error}
          </p>
        ) : null}
        <form action={createJob} style={{ display: "grid", gap: "0.5rem", maxWidth: 520 }}>
          <input type="hidden" name="user" value={session.sub} />
          <input type="hidden" name="role" value={session.role} />
          <label>
            タイトル <input name="title" required />
          </label>
          <label>
            公開状態{" "}
            <select name="status" defaultValue="draft">
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
          <label>
            雇用形態{" "}
            <select name="employmentType" defaultValue="full_time">
              <option value="full_time">full_time</option>
              <option value="contract">contract</option>
              <option value="part_time">part_time</option>
              <option value="internship">internship</option>
            </select>
          </label>
          <label>
            勤務地 <input name="location" />
          </label>
          <label>
            リモート{" "}
            <select name="remote" defaultValue="false">
              <option value="true">可</option>
              <option value="false">出社</option>
            </select>
          </label>
          <label>
            年収下限 <input name="salaryMin" inputMode="numeric" />
          </label>
          <label>
            年収上限 <input name="salaryMax" inputMode="numeric" />
          </label>
          <label>
            スキル（カンマ） <input name="skills" placeholder="Go,PostgreSQL" />
          </label>
          <label>
            本文
            <br />
            <textarea name="description" rows={6} />
          </label>
          <button type="submit">作成</button>
        </form>
      </main>
    </AppShell>
  );
}
