import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Edit, Phone, Video, Send, Image, Mic, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { currentUser, users } from '../data/mockData';

export default function MessagesPage() {
  const { messages: messageList } = useApp();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; fromMe: boolean; time: string }>>([
    { id: '1', text: 'Hey! How are you?', fromMe: false, time: '10:30 AM' },
    { id: '2', text: "I'm good! Just saw your latest post 🔥", fromMe: true, time: '10:31 AM' },
    { id: '3', text: 'Thanks! Took me forever to edit 😅', fromMe: false, time: '10:32 AM' },
    { id: '4', text: 'It looks amazing though!', fromMe: true, time: '10:33 AM' },
    { id: '5', text: 'We should collab sometime!', fromMe: false, time: '10:35 AM' },
  ]);

  const selectedUser = selectedChat ? users.find(u => u.id === selectedChat) : null;

  const handleSend = () => {
    if (messageText.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: messageText,
        fromMe: true,
        time: 'Now',
      }]);
      setMessageText('');
    }
  };

  if (selectedChat && selectedUser) {
    return (
      <div className="h-full flex flex-col bg-black">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedChat(null)} className="text-white">
              <ArrowLeft size={22} />
            </button>
            <img src={selectedUser.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white text-sm font-semibold">{selectedUser.username}</span>
                {selectedUser.isVerified && <span className="text-secondary text-xs">✓</span>}
              </div>
              <span className="text-green-400 text-xs">Active now</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white"><Phone size={20} /></button>
            <button className="text-white"><Video size={20} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 space-y-3">
          {/* User info card */}
          <div className="flex flex-col items-center py-6">
            <img src={selectedUser.avatar} alt="" className="w-20 h-20 rounded-full object-cover mb-2" />
            <p className="text-white font-bold">{selectedUser.displayName}</p>
            <p className="text-gray-text text-sm">{selectedUser.username} · Vibe</p>
            <button className="mt-2 bg-dark-card border border-dark-border rounded-lg px-4 py-1.5 text-white text-sm">
              View profile
            </button>
          </div>

          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.fromMe
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-dark-card text-white rounded-bl-md'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.fromMe ? 'text-white/60' : 'text-gray-text'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-dark-border">
          <div className="flex items-center gap-2">
            <button className="text-secondary"><Image size={22} /></button>
            <button className="text-secondary"><Mic size={22} /></button>
          </div>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message..."
            className="flex-1 bg-dark-card text-white text-sm px-4 py-2.5 rounded-full outline-none border border-dark-border focus:border-primary placeholder-gray-text"
          />
          {messageText.trim() ? (
            <button onClick={handleSend} className="text-primary font-semibold text-sm">
              <Send size={22} />
            </button>
          ) : (
            <button className="text-primary">
              <Heart size={22} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-xl font-bold">{currentUser.username}</h1>
          <span className="text-gray-text">▼</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white">
            <Edit size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-text" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-dark-card text-white text-sm pl-9 pr-4 py-2 rounded-lg outline-none border border-dark-border focus:border-primary placeholder-gray-text"
          />
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">Messages</span>
          <span className="text-secondary text-sm">Requests</span>
        </div>

        {messageList.map(msg => (
          <div
            key={msg.id}
            onClick={() => setSelectedChat(msg.user.id)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-dark-card/50 transition-colors"
          >
            <div className="relative flex-shrink-0">
              <img src={msg.user.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-black" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className={`text-sm ${msg.unread > 0 ? 'text-white font-bold' : 'text-white'}`}>
                  {msg.user.username}
                </span>
                {msg.user.isVerified && <span className="text-secondary text-xs">✓</span>}
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm truncate ${msg.unread > 0 ? 'text-white font-medium' : 'text-gray-text'}`}>
                  {msg.lastMessage}
                </span>
                <span className="text-gray-text text-xs flex-shrink-0">· {msg.timestamp}</span>
              </div>
            </div>
            {msg.unread > 0 && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">{msg.unread}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
