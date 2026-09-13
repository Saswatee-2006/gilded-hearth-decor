import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function GlobalBackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/" || location.pathname.startsWith("/checkout")) {
    return null;
  }

  const handleBack = () => {
    // Check if there is meaningful history within the app
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-2 md:px-8">
        <button
          onClick={handleBack}
          className="group inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
      </div>
    </div>
  );
}
