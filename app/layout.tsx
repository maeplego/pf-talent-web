export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: "2rem", maxWidth: 960, lineHeight: 1.5 }}>
        {children}
      </body>
    </html>
  );
}
