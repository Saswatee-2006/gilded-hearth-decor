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
    // Check if there is meaningful history within the app by verifying React Router's internal state index
    const hasHistory = window.history.state && window.history.state.idx > 0;

    if (hasHistory) {
      navigate(-1);
    } else {
      // Sensible fallbacks when opening a deep link directly
      if (location.pathname.startsWith("/product/")) {
        navigate("/shop");
      } else if (
        location.pathname.startsWith("/category/") ||
        location.pathname.startsWith("/collection/")
      ) {
        navigate("/shop");
      } else if (location.pathname.startsWith("/checkout")) {
        navigate("/cart");
      } else if (location.pathname.startsWith("/journal/")) {
        navigate("/journal");
      } else {
        navigate("/");
      }
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
