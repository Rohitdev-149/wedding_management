/**
 * Route Preloader - Preloads commonly accessed pages in the background
 * This improves perceived performance by having pages ready when users navigate
 */

// Dynamically import frequently used pages
const preloadedRoutes = {};

/**
 * Preload a route component to improve navigation speed
 * @param {string} name - Route name (for identification)
 * @param {Function} importFunc - Dynamic import function
 */
export const preloadRoute = (name, importFunc) => {
  if (!preloadedRoutes[name]) {
    // Silently preload in background - errors are ignored
    importFunc().catch(() => {
      // Preload failed, but that's okay - it'll load normally when needed
    });
    preloadedRoutes[name] = true;
  }
};

/**
 * Preload critical routes after a small delay
 * This is called after the initial page load is complete
 */
export const preloadCriticalRoutes = () => {
  // Delay preloading to avoid impacting initial page load
  setTimeout(() => {
    // Preload commonly accessed pages
    preloadRoute("Dashboard", () =>
      import("../pages/Dashboard").then((m) => m.default),
    );
    preloadRoute("Wedding", () =>
      import("../pages/couple/WeddingDetailsPage").then((m) => m.default),
    );
    preloadRoute("Profile", () =>
      import("../pages/ProfilePage").then((m) => m.default),
    );
  }, 2000); // Start preloading after 2 seconds
};

/**
 * Preload user-role-specific routes based on their role
 * @param {string} role - User role (couple, vendor, planner, admin)
 */
export const preloadRoleSpecificRoutes = (role) => {
  if (role === "couple") {
    preloadRoute("Budget", () =>
      import("../pages/couple/BudgetPage").then((m) => m.default),
    );
    preloadRoute("Guests", () =>
      import("../pages/couple/GuestsPage").then((m) => m.default),
    );
    preloadRoute("Timeline", () =>
      import("../pages/couple/TimelinePage").then((m) => m.default),
    );
    preloadRoute("Vendors", () =>
      import("../pages/couple/VendorsPage").then((m) => m.default),
    );
    preloadRoute("Bookings", () =>
      import("../pages/couple/BookingsPage").then((m) => m.default),
    );
  } else if (role === "vendor") {
    preloadRoute("VendorBookings", () =>
      import("../pages/vendor/VendorBookingsPage").then((m) => m.default),
    );
  } else if (role === "planner") {
    // Add planner-specific routes when they exist
  } else if (role === "admin") {
    // Add admin-specific routes when they exist
  }
};
