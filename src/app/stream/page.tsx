import { Header } from "@/components/header";
import { ToastProvider } from "@/components/toast";
import { StreamContent } from "./stream-content";

export const dynamic = "force-dynamic";

export default function StreamPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <ToastProvider />
      <StreamContent />
    </div>
  );
}
