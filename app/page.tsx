import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { saveSearch } from "@/app/actions";
import { AppShell, LoginGate } from "@/components/AppShell";
import { buildJobsQuery, talentFetch } from "@/lib/api";
import { loadTalentSession, sessionQuery } from "@/lib/session";
import type { Facets, Job } from "@/lib/types";

function salaryLabel(job: Job): string {
  if (job.salaryMin === null && job.salaryMax === null) {
    return "応相談";
  }
  const min = job.salaryMin !== null ? `${job.salaryMin.toLocaleString()}円` : "?";
  const max = job.salaryMax !== null ? `${job.salaryMax.toLocaleString()}円` : "?";
  return `${min}〜${max}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    user?: string;
    role?: string;
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
  const session = await loadTalentSession(sp);
  if (!session) {
    return <LoginGate />;
  }

  const filters = {
    q: sp.q,
    employmentType: sp.employmentType,
    remote: sp.remote,
    skills: sp.skills,
    salaryMin: sp.salaryMin,
    salaryMax: sp.salaryMax,
  };
  const query = buildJobsQuery(filters);
  const jobsPath = query ? `/v1/jobs?${query}` : "/v1/jobs";
  const facetsPath = query ? `/v1/jobs/facets?${query}` : "/v1/jobs/facets";

  const [jobsResult, facetsResult] = await Promise.all([
    talentFetch<Job[]>(jobsPath, session),
    talentFetch<Facets>(facetsPath, session),
  ]);

  const error = !jobsResult.ok ? jobsResult.error : !facetsResult.ok ? facetsResult.error : null;
  const jobs = jobsResult.ok ? jobsResult.data : [];
  const facets = facetsResult.ok ? facetsResult.data : null;

  return (
    <AppShell session={session}>
      <section className="hero">
        <h1 className="page-title">求人検索</h1>
        <p className="page-lead">キーワード・雇用形態・スキルで学習用求人を絞り込みます。</p>
      </section>
      <div className="card stack" style={{ marginBottom: "1.5rem" }}>
        <form method="get" className="stack">
          <input type="hidden" name="user" value={session.sub} />
          <input type="hidden" name="role" value={session.role} />
          <label>
            キーワード{" "}
            <input name="q" defaultValue={filters.q ?? ""} placeholder="Go, Kubernetes…" />
          </label>
          <label>
            雇用形態{" "}
            <select name="employmentType" defaultValue={filters.employmentType ?? ""}>
              <option value="">指定なし</option>
              <option value="full_time">full_time</option>
              <option value="contract">contract</option>
              <option value="part_time">part_time</option>
              <option value="internship">internship</option>
            </select>
          </label>
          <label>
            リモート{" "}
            <select name="remote" defaultValue={filters.remote ?? ""}>
              <option value="">指定なし</option>
              <option value="true">可</option>
              <option value="false">出社</option>
            </select>
          </label>
          <label>
            スキル（カンマ） <input name="skills" defaultValue={filters.skills ?? ""} placeholder="Go,React" />
          </label>
          <label>
            年収下限 <input name="salaryMin" defaultValue={filters.salaryMin ?? ""} inputMode="numeric" />
          </label>
          <label>
            年収上限 <input name="salaryMax" defaultValue={filters.salaryMax ?? ""} inputMode="numeric" />
          </label>
          <button type="submit" className="btn">
            検索
          </button>
        </form>
      </div>
      <form action={saveSearch} className="card stack" style={{ marginBottom: "1.5rem" }}>
          <input type="hidden" name="user" value={session.sub} />
          <input type="hidden" name="role" value={session.role} />
          <input type="hidden" name="q" value={filters.q ?? ""} />
          <input type="hidden" name="employmentType" value={filters.employmentType ?? ""} />
          <input type="hidden" name="remote" value={filters.remote ?? ""} />
          <input type="hidden" name="skills" value={filters.skills ?? ""} />
          <input type="hidden" name="salaryMin" value={filters.salaryMin ?? ""} />
          <input type="hidden" name="salaryMax" value={filters.salaryMax ?? ""} />
          <label>
            この条件を保存{" "}
            <input name="name" required placeholder="名前" />
          </label>{" "}
          <button type="submit" className="btn btn-secondary">
            保存検索にする
          </button>
        </form>

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="card-grid" style={{ gridTemplateColumns: "220px 1fr" }}>
          <aside className="card">
            <h2>ファセット</h2>
            {facets ? (
              <>
                <p>
                  件数: <strong>{facets.total}</strong>
                  {facets.total === jobs.length ? "（一覧と一致）" : `（一覧 ${jobs.length} 件）`}
                </p>
                <h3>雇用形態</h3>
                <ul>
                  {Object.entries(facets.employmentType).map(([key, count]) => (
                    <li key={key}>
                      <Link href={`/${sessionQuery(session, { ...filters, employmentType: key })}`}>
                        {key}
                      </Link>{" "}
                      ({count})
                    </li>
                  ))}
                </ul>
                <h3>リモート</h3>
                <ul>
                  {Object.entries(facets.remote).map(([key, count]) => (
                    <li key={key}>
                      <Link href={`/${sessionQuery(session, { ...filters, remote: key })}`}>{key}</Link> ({count})
                    </li>
                  ))}
                </ul>
                <h3>スキル</h3>
                <ul>
                  {Object.entries(facets.skills).map(([key, count]) => (
                    <li key={key}>
                      <Link href={`/${sessionQuery(session, { ...filters, skills: key })}`}>{key}</Link> ({count})
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>ファセットを取得できません。</p>
            )}
          </aside>
          <section className="card stack">
            <h2 style={{ margin: 0 }}>結果 {jobs.length} 件</h2>
            {jobs.length === 0 && !error ? <p className="muted">該当する求人はありません。</p> : null}
            {jobs.map((job) => (
              <div key={job.id} className="stack" style={{ paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                <Link href={`/jobs/${job.id}${sessionQuery(session)}`}>
                  <strong>{job.title}</strong>
                </Link>
                <div className="muted">
                  {job.employmentType} · {job.remote ? "remote" : job.location || "office"} · {salaryLabel(job)}
                </div>
                <div className="pill">{job.skills.join(", ")}</div>
              </div>
            ))}
          </section>
        </div>
    </AppShell>
  );
}
