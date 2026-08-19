import { unstable_noStore as noStore } from "next/cache";

import { saveProfile } from "@/app/actions";
import { AppShell, LoginGate } from "@/components/AppShell";
import { talentFetch } from "@/lib/api";
import { parseDevSession } from "@/lib/session";
import type { CandidateProfile } from "@/lib/types";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; role?: string; error?: string; saved?: string }>;
}) {
  noStore();
  const sp = await searchParams;
  const session = parseDevSession(sp);
  if (!session) {
    return <LoginGate />;
  }

  const result = await talentFetch<CandidateProfile>(`/v1/profiles/${session.sub}`, session);
  const profile = result.ok ? result.data : null;

  return (
    <AppShell session={session}>
      <main>
        <h1>プロフィール</h1>
        {sp.saved ? <p>保存しました。</p> : null}
        {sp.error ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {sp.error}
          </p>
        ) : null}
        {!result.ok && result.status !== 404 ? (
          <p role="alert" style={{ color: "#b00020" }}>
            {result.error}
          </p>
        ) : null}
        <form action={saveProfile} style={{ display: "grid", gap: "0.5rem", maxWidth: 480 }}>
          <input type="hidden" name="user" value={session.sub} />
          <input type="hidden" name="role" value={session.role} />
          <label>
            表示名 <input name="displayName" defaultValue={profile?.displayName ?? session.sub} required />
          </label>
          <label>
            スキル（カンマ） <input name="skills" defaultValue={profile?.skills.join(",") ?? ""} />
          </label>
          <label>
            希望雇用形態{" "}
            <select name="desiredEmploymentType" defaultValue={profile?.desiredEmploymentTypes[0] ?? "full_time"}>
              <option value="full_time">full_time</option>
              <option value="contract">contract</option>
              <option value="part_time">part_time</option>
              <option value="internship">internship</option>
            </select>
          </label>
          <label>
            希望年収下限 <input name="desiredMinSalary" defaultValue={profile?.desiredMinSalary ?? ""} />
          </label>
          <label>
            リモート希望{" "}
            <select name="desiredRemote" defaultValue={profile?.desiredRemote ? "true" : "false"}>
              <option value="true">はい</option>
              <option value="false">いいえ</option>
            </select>
          </label>
          <label>
            自己紹介
            <br />
            <textarea name="bio" rows={4} defaultValue={profile?.bio ?? ""} />
          </label>
          <button type="submit">保存</button>
        </form>
      </main>
    </AppShell>
  );
}
