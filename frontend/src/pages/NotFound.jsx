import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-7xl sm:text-8xl font-serif font-bold text-gray-200 tabular-nums">404</p>
        <h1 className="text-2xl font-serif font-bold text-gray-900 mt-4">
          Page not found
        </h1>
        <p className="text-gray-600 mt-2 mb-8">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
