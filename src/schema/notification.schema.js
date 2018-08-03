import { NotificationController } from '../controllers/notification.controller';

export const notificationType = `
  
  type Notification {
    type: String,
  }

  type Subscription {
    notification(userId: ID!): Notification
  }
`;

export const notificationResolver = {
  Subscription: {
    notification: {
      subscribe: NotificationController.subscribeToNotifications(),
    },
  },
};
