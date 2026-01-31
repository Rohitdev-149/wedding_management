import React from "react";

/**
 * Empty state for lists/cards when no data.
 * @param {React.ReactNode} icon - Icon or emoji
 * @param {string} title - Short title
 * @param {string} [description] - Optional description
 * @param {React.ReactNode} [action] - Optional CTA (e.g. Link or button)
 */
const EmptyState = ({ icon, title, description, action, className = "" }) => {
  return (
    <div className={`text-center py-12 px-4 rounded-2xl bg-gray-50 border border-gray-100 ${className}`}>
      <div className="text-4xl mb-4 opacity-80" aria-hidden>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-600 text-sm max-w-sm mx-auto mb-6">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
