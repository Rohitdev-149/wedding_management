import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-7xl sm:text-8xl font-serif font-bold text-gray-200 tabular-nums">403</p>
        <h1 className="text-2xl font-serif font-bold text-gray-900 mt-4">
          Access denied
        </h1>
        <p className="text-gray-600 mt-2 mb-8">
          You don’t have permission to view this page.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
