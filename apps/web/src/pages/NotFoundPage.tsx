import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-8 py-12 bg-background">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Code - Nordic minimalism: light, not alarming */}
        <div className="space-y-3">
          <p className="text-8xl font-light tracking-wider text-foreground/20">
            404
          </p>
          <h1 className="text-3xl font-light tracking-wide text-foreground">
            Page not found
          </h1>
        </div>

        {/* Message - Calm and helpful */}
        <p className="text-base font-light leading-relaxed text-muted-foreground/70 tracking-wide max-w-lg mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Actions - Simple, clear options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            asChild
            className="h-11 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-light text-sm tracking-wide shadow-none transition-all duration-200"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 px-6 rounded-lg bg-transparent hover:bg-accent/5 text-foreground/70 hover:text-foreground border border-border/30 font-light text-sm tracking-wide shadow-none transition-all duration-200"
          >
            <Link to="#" onClick={() => window.history.back()} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go back
            </Link>
          </Button>
        </div>

        {/* Subtle decoration */}
        <div className="pt-12">
          <div className="h-px w-24 mx-auto bg-border/20" />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
