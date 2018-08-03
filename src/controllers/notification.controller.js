import { PubSub, withFilter } from 'graphql-subscriptions';
import { NotificationModel } from '../models/notification.model';

const notificationPubSub = new PubSub();

export const NotificationType = {
  ADD_TUTORIAL_CLASS_PARTICIPANT: 'addTutorialClassParticipant',
};

export const NotificationController = {
  async createNotification(type, toUsers) {
    await new NotificationModel({ type, toUsers }).save();

    notificationPubSub.publish('sendNotification', {
      toUsers,
      notification: { type },
    });
  },

  subscribeToNotifications() {
    return withFilter(
      () => notificationPubSub.asyncIterator('sendNotification'),
      ({ toUsers }, { userId }) => toUsers.indexOf(userId) >= 0,
    );
  },
};
