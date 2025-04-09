import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function calculateMonthlyPayment(total: number, months: number): number {
  return total / months;
}

export function calculateFinancedAmount(amount: number, rate: number): number {
  return amount * (1 + rate / 100);
}
