import { Header } from "./Header";
import { Footer } from "./Footer";
import { ReceptionistWidget } from "./ReceptionistWidget";
import { ScrollTop } from "./ScrollTop";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ReceptionistWidget />
      <ScrollTop />
    </>
  );
}
