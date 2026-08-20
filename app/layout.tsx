import "./globals.css";

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="site-brand">
              <strong>pf-talent</strong>
              <span className="muted">学習用求人マッチング</span>
            </div>
          </header>
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
