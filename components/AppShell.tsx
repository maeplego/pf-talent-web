import Link from "next/link";
import type { DevSession } from "../lib/session";
import { sessionQuery } from "../lib/session";

export function AppShell({
  session,
  children,
}: {
  session: DevSession;
  children: React.ReactNode;
}) {
  const q = sessionQuery(session);
  return (
    <>
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid #ddd", paddingBottom: "1rem" }}>
        <Link href={`/${q}`} style={{ textDecoration: "none", color: "inherit" }}>
          <strong>pf-talent</strong>
        </Link>
        <span style={{ color: "#666", marginLeft: "0.75rem", fontSize: "0.9rem" }}>学習用求人マッチング</span>
        <nav style={{ marginTop: "0.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href={`/${q}`}>検索</Link>
          {session.role === "candidate" || session.role === "admin" ? (
            <>
              <Link href={`/me/applications${q}`}>マイ応募</Link>
              <Link href={`/me/saved-searches${q}`}>保存検索</Link>
              <Link href={`/me/profile${q}`}>プロフィール</Link>
            </>
          ) : null}
          {session.role === "employer" || session.role === "admin" ? (
            <>
              <Link href={`/employer/jobs${q}`}>求人管理</Link>
              <Link href={`/employer/jobs/new${q}`}>求人作成</Link>
            </>
          ) : null}
          {session.role === "admin" ? <Link href={`/admin/reports${q}`}>通報</Link> : null}
        </nav>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#555" }}>
          ユーザー <code>{session.sub}</code> / ロール <code>{session.role}</code>
          {" · "}
          <Link href={`/${sessionQuery({ sub: "candidate-1", role: "candidate" })}`}>candidate-1</Link>
          {" · "}
          <Link href={`/${sessionQuery({ sub: "employer-1", role: "employer" })}`}>employer-1</Link>
          {" · "}
          <Link href={`/${sessionQuery({ sub: "employer-2", role: "employer" })}`}>employer-2</Link>
        </p>
      </header>
      {children}
    </>
  );
}

export function LoginGate() {
  return (
    <main>
      <h1>開発ユーザーを選ぶ</h1>
      <p>未ログインのゲスト画面は出さない。開発時は <code>?user=</code> が必須です。</p>
      <ul>
        <li>
          <Link href="/?user=candidate-1&role=candidate">candidate-1（候補者）</Link>
        </li>
        <li>
          <Link href="/?user=employer-1&role=employer">employer-1（企業）</Link>
        </li>
        <li>
          <Link href="/?user=employer-2&role=employer">employer-2（他社）</Link>
        </li>
        <li>
          <Link href="/?user=admin-1&role=admin">admin-1（管理）</Link>
        </li>
      </ul>
    </main>
  );
}
