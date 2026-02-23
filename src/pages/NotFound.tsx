import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-sm">
        <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl font-bold">404</h1>
        <p className="mb-3 sm:mb-4 text-base sm:text-xl text-muted-foreground">
          Oops! Page not found
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm sm:text-base w-full sm:w-auto"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
