import Link from "next/link";
import type { DevSession } from "../lib/session";
import { sessionQuery } from "../lib/session";
import { oidcEnabled } from "../lib/oidc/env";

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
      <nav className="site-nav" style={{ marginBottom: "1rem" }}>
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
      <p className="muted row">
        <span>
          ユーザー <code>{session.sub}</code> / ロール <code>{session.role}</code>
        </span>
        <Link href={`/${sessionQuery({ sub: "candidate-1", role: "candidate" })}`}>candidate-1</Link>
        <Link href={`/${sessionQuery({ sub: "employer-1", role: "employer" })}`}>employer-1</Link>
        <Link href={`/${sessionQuery({ sub: "employer-2", role: "employer" })}`}>employer-2</Link>
        {oidcEnabled() ? (
          <form action="/logout" method="post">
            <button type="submit" className="btn btn-secondary">
              ログアウト
            </button>
          </form>
        ) : null}
      </p>
      {children}
    </>
  );
}

export function LoginGate() {
  return (
    <>
      <section className="hero">
        <h1 className="page-title">開発ユーザーを選ぶ</h1>
        <p className="page-lead">
          未ログインのゲスト画面は出さない。開発時は <code>?user=</code> が必須です。
        </p>
        {oidcEnabled() ? (
          <p className="muted">
            overlay では先に IdP ログインします（<a href="/login">/login</a>）。ログイン後も学習用の acting user は{" "}
            <code>?user=</code> です。
          </p>
        ) : null}
      </section>
      <div className="card-grid">
        <Link className="card" href="/?user=candidate-1&role=candidate">
          <strong>candidate-1</strong>
          <p className="muted">候補者</p>
        </Link>
        <Link className="card" href="/?user=employer-1&role=employer">
          <strong>employer-1</strong>
          <p className="muted">企業</p>
        </Link>
        <Link className="card" href="/?user=employer-2&role=employer">
          <strong>employer-2</strong>
          <p className="muted">他社</p>
        </Link>
        <Link className="card" href="/?user=admin-1&role=admin">
          <strong>admin-1</strong>
          <p className="muted">管理</p>
        </Link>
      </div>
    </>
  );
}
