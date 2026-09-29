import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CreatePage from './pages/CreatePage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';

function AppContent() {
  const location = useLocation();
  const isMessagesChat = location.pathname === '/messages';

  return (
    <div className="h-full w-full max-w-lg mx-auto relative bg-black overflow-hidden">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
      {!isMessagesChat && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </HashRouter>
  );
}
