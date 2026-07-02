import { Header } from "./Header";
import { Footer } from "./Footer";
import { ReceptionistWidget } from "./ReceptionistWidget";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ReceptionistWidget />
    </>
  );
}
