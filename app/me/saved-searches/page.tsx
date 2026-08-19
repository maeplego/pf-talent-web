import { unstable_noStore as noStore } from "next/cache";

import { AppShell, LoginGate } from "../../components/AppShell";
import { parseDevSession } from "../../lib/session";

export default async function SavedSearchesPlaceholder({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; role?: string }>;
}) {
  noStore();
  const session = parseDevSession(await searchParams);
  if (!session) {
    return <LoginGate />;
  }
  return (
    <AppShell session={session}>
      <main>
        <h1>保存検索</h1>
        <p>作成 / 一覧 / run は次スライスで足す。</p>
      </main>
    </AppShell>
  );
}
