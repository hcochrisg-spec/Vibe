import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Grid3X3, Bookmark, Film, Heart, ChevronDown, UserPlus, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { currentUser, users, posts } from '../data/mockData';
import PostCard from '../components/PostCard';
import CommentsModal from '../components/CommentsModal';

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toggleFollow, toggleLike, toggleSave } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');
  const [commentsOpen, setCommentsOpen] = useState(false);

  const isOwnProfile = !userId || userId === 'current';
  const user = isOwnProfile ? currentUser : users.find(u => u.id === userId) || currentUser;
  const userPosts = isOwnProfile ? posts.slice(0, 6) : posts.filter(p => p.user.id === user.id);

  const formatCount = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="h-full flex flex-col bg-black pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <div className="flex items-center gap-1">
          <h1 className="text-white text-xl font-bold">{user.username}</h1>
          {user.isVerified && <span className="text-secondary text-sm">✓</span>}
          <ChevronDown size={16} className="text-white" />
        </div>
        <div className="flex items-center gap-3">
          {isOwnProfile ? (
            <>
              <button onClick={() => navigate('/create')} className="text-white">
                <Film size={24} />
              </button>
              <button className="text-white">
                <Settings size={22} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/messages')}
                className="text-white"
              >
                <MessageCircle size={22} />
              </button>
              <button className="text-white">
                <ChevronDown size={22} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Profile Info */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="story-ring flex-shrink-0">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-black"
              />
            </div>

            {/* Stats */}
            <div className="flex-1 flex justify-around">
              <div className="text-center">
                <p className="text-white text-lg font-bold">{userPosts.length}</p>
                <p className="text-gray-text text-xs">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-bold">{formatCount(user.followers)}</p>
                <p className="text-gray-text text-xs">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-bold">{formatCount(user.following)}</p>
                <p className="text-gray-text text-xs">Following</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-3">
            <p className="text-white text-sm font-semibold">{user.displayName}</p>
            <p className="text-gray-200 text-sm mt-1 whitespace-pre-line">{user.bio}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {isOwnProfile ? (
              <>
                <button className="flex-1 bg-dark-card border border-dark-border rounded-lg py-2 text-white text-sm font-semibold hover:bg-dark-border transition-colors">
                  Edit profile
                </button>
                <button className="flex-1 bg-dark-card border border-dark-border rounded-lg py-2 text-white text-sm font-semibold hover:bg-dark-border transition-colors">
                  Share profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                    user.isFollowing
                      ? 'bg-dark-card border border-dark-border text-white'
                      : 'bg-primary text-white'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={() => navigate('/messages')}
                  className="flex-1 bg-dark-card border border-dark-border rounded-lg py-2 text-white text-sm font-semibold hover:bg-dark-border transition-colors"
                >
                  Message
                </button>
                <button className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white">
                  <UserPlus size={18} />
                </button>
              </>
            )}
          </div>

          {/* Highlights */}
          <div className="flex gap-4 mt-5 overflow-x-auto hide-scrollbar pb-2">
            {['Travel', 'Food', 'Life', 'Work'].map((highlight) => (
              <div key={highlight} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-16 h-16 rounded-full border border-dark-border flex items-center justify-center bg-dark-card">
                  <span className="text-2xl">
                    {highlight === 'Travel' ? '✈️' : highlight === 'Food' ? '🍕' : highlight === 'Life' ? '✨' : '💼'}
                  </span>
                </div>
                <span className="text-xs text-gray-text">{highlight}</span>
              </div>
            ))}
            {isOwnProfile && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-16 h-16 rounded-full border border-dark-border flex items-center justify-center bg-dark-card">
                  <span className="text-2xl text-gray-text">+</span>
                </div>
                <span className="text-xs text-gray-text">New</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-b border-dark-border">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 border-b-2 transition-colors ${
              activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-gray-text'
            }`}
          >
            <Grid3X3 size={20} />
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                activeTab === 'saved' ? 'border-white text-white' : 'border-transparent text-gray-text'
              }`}
            >
              <Bookmark size={20} />
            </button>
          )}
          <button
            onClick={() => setActiveTab('tagged')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 border-b-2 transition-colors ${
              activeTab === 'tagged' ? 'border-white text-white' : 'border-transparent text-gray-text'
            }`}
          >
            <Heart size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-0.5">
          {(activeTab === 'posts' ? userPosts : activeTab === 'saved' ? posts.filter(p => p.isSaved) : posts.slice(0, 3)).map(post => (
            <div
              key={post.id}
              className="aspect-square relative cursor-pointer group"
              onClick={() => setCommentsOpen(true)}
            >
              <img
                src={post.mediaUrl}
                alt=""
                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
              />
              {post.type === 'video' && (
                <div className="absolute top-1.5 right-1.5">
                  <Film size={14} className="text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Heart size={16} className="fill-white" />
                    <span className="text-sm font-medium">{formatCount(post.likes)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CommentsModal isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </div>
  );
}
