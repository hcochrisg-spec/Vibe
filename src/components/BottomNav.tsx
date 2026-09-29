import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useApp();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Search, label: 'Explore' },
    { path: '/create', icon: PlusSquare, label: 'Create' },
    { path: '/notifications', icon: Heart, label: 'Activity' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  // Hide nav on messages/chat pages
  if (location.pathname === '/messages') {
    return null;
  }

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-dark-border">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all relative ${
                isActive ? 'text-white' : 'text-gray-text'
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                {label === 'Activity' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
