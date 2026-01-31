import React from "react";

const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-primary-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
