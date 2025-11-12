export type ActivityStatus = "Planned" | "In Progress" | "Completed" | "Cancelled";

export interface Activity {
  id: string;
  title: string;
  status: ActivityStatus;
  participants: number;
  women: number;
  location: string;
  venueCost: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  organizedBy: string;
  notes: string;
  [key: string]: any;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
}