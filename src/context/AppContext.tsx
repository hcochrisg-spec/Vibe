import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Post,
  Comment,
  User,
  ChatMessage,
  Notification,
  Message,
  currentUser,
  posts as initialPosts,
  users as initialUsers,
  comments as initialComments,
  notifications as initialNotifications,
  messages as initialMessages,
  messageThreads as initialMessageThreads,
} from '../data/mockData';

interface NewPostInput {
  mediaUrl: string;
  caption: string;
  type: Post['type'];
}

interface AppState {
  currentUser: User;
  users: User[];
  posts: Post[];
  comments: Comment[];
  getUser: (userId: string) => User | undefined;
  notifications: Notification[];
  messages: Message[];
  messageThreads: Record<string, ChatMessage[]>;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  toggleFollow: (userId: string) => void;
  toggleCommentLike: (commentId: string) => void;
  addComment: (postId: string, text: string) => void;
  addPost: (input: NewPostInput) => void;
  openConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractTags(caption: string): string[] {
  return (caption.match(/#(\w+)/g) ?? []).map(tag => tag.slice(1).toLowerCase());
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [messageThreads, setMessageThreads] =
    useState<Record<string, ChatMessage[]>>(initialMessageThreads);

  const toggleLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  }, []);

  const toggleSave = useCallback((postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved, saves: post.isSaved ? post.saves - 1 : post.saves + 1 }
        : post
    ));
  }, []);

  const toggleFollow = useCallback((userId: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId
        ? { ...user, isFollowing: !user.isFollowing, followers: user.isFollowing ? user.followers - 1 : user.followers + 1 }
        : user
    ));
  }, []);

  const getUser = useCallback((userId: string) => {
    if (userId === currentUser.id) return currentUser;
    return users.find(user => user.id === userId);
  }, [users]);

  const toggleCommentLike = useCallback((commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  }, []);

  const addComment = useCallback((postId: string, text: string) => {
    const newComment: Comment = {
      id: createId('comment'),
      postId,
      userId: currentUser.id,
      text,
      likes: 0,
      isLiked: false,
      createdAt: 'Just now',
    };
    setComments(prev => [newComment, ...prev]);
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, comments: post.comments + 1 } : post
    ));
  }, []);

  const addPost = useCallback(({ mediaUrl, caption, type }: NewPostInput) => {
    const newPost: Post = {
      id: createId('post'),
      userId: currentUser.id,
      type,
      mediaUrl,
      thumbnailUrl: type === 'video' ? mediaUrl : undefined,
      caption,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      isLiked: false,
      isSaved: false,
      createdAt: 'Just now',
      tags: extractTags(caption),
    };
    setPosts(prev => [newPost, ...prev]);
  }, []);

  const openConversation = useCallback((conversationId: string) => {
    setMessages(prev => prev.map(message =>
      message.id === conversationId ? { ...message, unread: 0 } : message
    ));
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const chatMessage: ChatMessage = {
      id: createId('message'),
      text: trimmed,
      fromMe: true,
      time: 'Now',
    };
    setMessageThreads(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), chatMessage],
    }));
    setMessages(prev => prev.map(message =>
      message.id === conversationId
        ? { ...message, lastMessage: trimmed, timestamp: 'now', unread: 0 }
        : message
    ));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      posts,
      comments,
      getUser,
      notifications,
      messages,
      messageThreads,
      toggleLike,
      toggleSave,
      toggleFollow,
      toggleCommentLike,
      addComment,
      addPost,
      openConversation,
      sendMessage,
      markNotificationRead,
      markAllNotificationsRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
