import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getOrderStatusVariant(status: string) {
  const map: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
    new: "info",
    confirmed: "success",
    shipped: "warning",
    delivered: "success",
    rejected: "danger",
  };
  return map[status] ?? "neutral";
}

export function getProductStatusVariant(status: string) {
  const map: Record<string, "success" | "warning" | "danger" | "neutral"> = {
    active: "success",
    inactive: "neutral",
    out_of_stock: "danger",
  };
  return map[status] ?? "neutral";
}
