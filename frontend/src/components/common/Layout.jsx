import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HeartIcon,
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Memoize navigation array based on user role
  const navigation = useMemo(() => {
    const baseNav = [{ name: "Dashboard", href: "/dashboard", icon: HomeIcon }];

    if (user?.role === "couple") {
      return [
        ...baseNav,
        { name: "My Wedding", href: "/wedding", icon: HeartIcon },
        { name: "Budget", href: "/budget", icon: CurrencyDollarIcon },
        { name: "Guests", href: "/guests", icon: UsersIcon },
        { name: "Timeline", href: "/timeline", icon: CalendarIcon },
        { name: "Vendors", href: "/vendors", icon: ShoppingBagIcon },
        { name: "Bookings", href: "/bookings", icon: ClockIcon },
        { name: "Profile", href: "/profile", icon: Cog6ToothIcon },
      ];
    }

    if (user?.role === "vendor") {
      return [
        ...baseNav,
        { name: "My Bookings", href: "/vendor/bookings", icon: ClockIcon },
        { name: "Profile", href: "/profile", icon: Cog6ToothIcon },
      ];
    }

    if (user?.role === "planner") {
      return [
        ...baseNav,
        { name: "Weddings", href: "/planner/weddings", icon: HeartIcon },
        { name: "Calendar", href: "/planner/calendar", icon: CalendarIcon },
        { name: "Profile", href: "/profile", icon: Cog6ToothIcon },
      ];
    }

    if (user?.role === "admin") {
      return [
        ...baseNav,
        { name: "All Weddings", href: "/admin/weddings", icon: HeartIcon },
        { name: "Users", href: "/admin/users", icon: UsersIcon },
        { name: "Vendors", href: "/admin/vendors", icon: ShoppingBagIcon },
        { name: "Profile", href: "/profile", icon: Cog6ToothIcon },
      ];
    }

    return baseNav;
  }, [user?.role]);

  const isActive = useCallback(
    (href) => {
      return location.pathname === href;
    },
    [location.pathname],
  );

  return (
    <div className="min-h-screen bg-surface-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-elevation-1 transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <HeartIcon className="w-7 h-7 text-primary-600" aria-hidden />
              <span className="text-lg font-serif font-semibold text-gray-900">
                Wedding Planner
              </span>
            </Link>
            <button
              type="button"
              onClick={closeSidebar}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={closeSidebar}
                >
                  <Icon className="w-5 h-5 shrink-0" aria-hidden />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <HeartIcon className="w-6 h-6 text-primary-600" />
              <span className="text-base font-serif font-semibold text-gray-900">
                Wedding Planner
              </span>
            </Link>
            <div className="w-10" />
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
          <div className="page-container py-6 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
