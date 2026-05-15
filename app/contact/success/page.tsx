import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SuccessPage() {
  return (
    <>
      <Navbar />

      <div className="pt-32 px-6 text-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Message Sent Successfully</h1>
        <p className="text-gray-700 text-lg">
          Thank you for contacting us. We will get back to you shortly.
        </p>
      </div>

      <Footer />
    </>
  );
}
