/**
 * Centralised colour constants for Dinely.
 *
 * Previously copy-pasted across AdminDashboard, StaffDashboard, EmployeeDashboard,
 * CustomerDashboard, and several panel components. Import from here instead.
 */

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#a259f7',
  STAFF: '#4d8ef0',
  EMPLOYEE: '#00c9a7',
  CUSTOMER: '#FF6B35',
};

export const STATUS_COLORS: Record<string, string> = {
  // Order statuses
  RECEIVED: '#d29922',
  PREPARING: '#58a6ff',
  READY: '#3fb950',
  FINISHED: '#6e7681',
  CANCELLED: '#f85149',
  // User / account statuses
  ACTIVE: '#3fb950',
  PENDING: '#d29922',
  REJECTED: '#f85149',
  DEACTIVATED: '#6e7681',
  // Employee-request statuses
  APPROVED: '#3fb950',
  DECLINED: '#f85149',
};

/** Background tint (10 % opacity) paired with each order status colour */
export const STATUS_BG: Record<string, string> = {
  RECEIVED: 'rgba(210,153,34,0.12)',
  PREPARING: 'rgba(88,166,255,0.12)',
  READY: 'rgba(63,185,80,0.12)',
  FINISHED: 'rgba(110,118,129,0.12)',
  CANCELLED: 'rgba(248,81,73,0.12)',
};
