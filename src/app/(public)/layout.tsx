import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="archive-shell">
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
