import { format, formatDistanceToNow } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "";
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return format(new Date(date), "MMM dd, yyyy hh:mm a");
};

export const formatTime = (time) => {
  if (!time) return "";
  // Convert 24h to 12h format
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatRelativeTime = (date) => {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const calculateDaysUntil = (date) => {
  if (!date) return 0;
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
