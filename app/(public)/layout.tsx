import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoPopup from "@/components/PromoPopup";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PromoPopup />   {/* ✅ Popup loads globally for all public pages */}
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
