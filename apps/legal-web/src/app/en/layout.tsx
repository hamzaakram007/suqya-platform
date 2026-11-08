export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" dir="ltr" style={{ fontFamily: "var(--sq-font-en)" }}>
      {children}
    </div>
  );
}
