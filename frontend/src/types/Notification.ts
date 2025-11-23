export type NotificationType = 'success' | 'error';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

