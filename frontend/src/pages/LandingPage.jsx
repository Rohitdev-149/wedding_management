import React from "react";
import { Link } from "react-router-dom";
import {
  HeartIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const LandingPage = () => {
  const features = [
    {
      icon: <UsersIcon className="w-12 h-12" />,
      title: "Guest List & RSVPs",
      description: "Easily manage and track guest responses",
    },
    {
      icon: <CurrencyDollarIcon className="w-12 h-12" />,
      title: "Budget Planner",
      description: "Set your budget and monitor expenses",
    },
    {
      icon: <CalendarIcon className="w-12 h-12" />,
      title: "Wedding Timeline",
      description: "Keep track of all your important dates",
    },
    {
      icon: <HeartIcon className="w-12 h-12" />,
      title: "Vendor Booking",
      description: "Find and book best vendors",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Create Your Account",
      description: "Easily manage and track guest responses",
    },
    {
      number: "2",
      title: "Add Your Wedding Details",
      description: "Set your budget and monitor expenses",
    },
    {
      number: "3",
      title: "Invite Guests & Book Vendors",
      description: "Keep track of all your important dates",
    },
    {
      number: "4",
      title: "Track Everything in One Dashboard",
      description: "Manage everything in one place",
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-elevation-1">
        <div className="page-container">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <HeartIcon className="w-7 h-7 text-primary-600" aria-hidden />
              <span className="text-lg font-serif font-semibold text-gray-900">
                Wedding Planner
              </span>
            </Link>
            <nav className="flex items-center gap-4" aria-label="Main">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden">
        <div className="page-container relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
              Plan your perfect wedding,{" "}
              <span className="text-primary-600">all in one place</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl">
              Manage guests, vendors, budget, and timeline — with one simple dashboard.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">
                Start for free
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                Sign in
              </Link>
            </div>
          </div>
          <div className="mt-16 lg:mt-20">
            <div className="card max-w-4xl mx-auto p-8 sm:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-500 mt-1">Happy couples</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900">1,000+</div>
                  <div className="text-sm text-gray-500 mt-1">Weddings planned</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900">200+</div>
                  <div className="text-sm text-gray-500 mt-1">Trusted vendors</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900">4.9</div>
                  <div className="text-sm text-gray-500 mt-1">Average rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-20 bg-white border-y border-gray-100">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              Everything you need
            </h2>
            <p className="mt-3 text-gray-600">
              One platform for guests, budget, timeline, and vendor bookings.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="text-primary-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              How it works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-primary-600">
        <div className="page-container text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Ready to plan your dream wedding?
          </h2>
          <p className="mt-3 text-primary-100 max-w-xl mx-auto">
            Create your account and set up your wedding in minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center mt-8 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
          >
            Start for free
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="page-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-2">
              <HeartIcon className="w-6 h-6 text-primary-600" aria-hidden />
              <span className="text-base font-serif font-semibold text-gray-900">
                Wedding Planner
              </span>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm text-gray-500" aria-label="Footer">
              <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
              <a href="#" className="hover:text-gray-900 transition-colors">About</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <Link to="/login" className="hover:text-gray-900 transition-colors">Sign in</Link>
            </nav>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            © {new Date().getFullYear()} Wedding Planner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
