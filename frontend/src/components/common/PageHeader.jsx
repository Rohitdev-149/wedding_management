import React from "react";

/**
 * Consistent page header for app pages.
 * @param {string} title - Page title
 * @param {string} [subtitle] - Optional subtitle/description
 * @param {React.ReactNode} [action] - Optional right-side action (e.g. button)
 */
const PageHeader = ({ title, subtitle, action, className = "" }) => {
  return (
    <div className={`page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
