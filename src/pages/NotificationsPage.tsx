import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, AtSign, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Notification } from '../data/mockData';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-primary fill-primary" />;
      case 'comment': return <MessageCircle size={16} className="text-secondary" />;
      case 'follow': return <UserPlus size={16} className="text-primary" />;
      case 'mention': return <AtSign size={16} className="text-yellow-400" />;
    }
  };

  const getIconBg = (type: Notification['type']) => {
    switch (type) {
      case 'like': return 'bg-primary/10';
      case 'comment': return 'bg-secondary/10';
      case 'follow': return 'bg-primary/10';
      case 'mention': return 'bg-yellow-400/10';
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-dark-card/50 ${
        !notification.isRead ? 'bg-dark-card/30' : ''
      }`}
      onClick={() => {
        markNotificationRead(notification.id);
        if (notification.type === 'follow') {
          navigate(`/profile/${notification.user.id}`);
        }
      }}
    >
      <div className="relative flex-shrink-0">
        <img
          src={notification.user.avatar}
          alt={notification.user.username}
          className="w-11 h-11 rounded-full object-cover"
        />
        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${getIconBg(notification.type)}`}>
          {getIcon(notification.type)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="text-white font-semibold">{notification.user.username}</span>
          <span className="text-gray-200"> {notification.text}</span>
          <span className="text-gray-text ml-1">{notification.createdAt}</span>
        </p>
      </div>
      {notification.postThumbnail && (
        <img
          src={notification.postThumbnail}
          alt=""
          className="w-10 h-10 rounded object-cover flex-shrink-0"
        />
      )}
      {notification.type === 'follow' && (
        <button
          onClick={(e) => e.stopPropagation()}
          className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex-shrink-0"
        >
          Follow
        </button>
      )}
      {!notification.isRead && (
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <h1 className="text-white text-xl font-bold">Notifications</h1>
        {unreadNotifications.length > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1 text-secondary text-sm"
          >
            <Check size={16} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Unread */}
        {unreadNotifications.length > 0 && (
          <div>
            <h3 className="px-4 py-2 text-white text-sm font-semibold">New</h3>
            {unreadNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}

        {/* Read */}
        {readNotifications.length > 0 && (
          <div className="mt-2">
            <h3 className="px-4 py-2 text-gray-text text-sm font-semibold">Earlier</h3>
            {readNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Heart size={48} className="text-gray-text mb-4" />
            <p className="text-gray-text text-center">No notifications yet</p>
            <p className="text-gray-text text-sm text-center mt-1">When someone interacts with you, you'll see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
