import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Post, Comment, User, currentUser, posts as initialPosts, users as initialUsers, comments as initialComments, notifications as initialNotifications, messages as initialMessages, Notification, Message } from '../data/mockData';

interface AppState {
  currentUser: User;
  users: User[];
  posts: Post[];
  comments: Comment[];
  notifications: Notification[];
  messages: Message[];
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  toggleFollow: (userId: string) => void;
  toggleCommentLike: (commentId: string) => void;
  addComment: (text: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [messages] = useState<Message[]>(initialMessages);

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

  const toggleCommentLike = useCallback((commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  }, []);

  const addComment = useCallback((text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      user: currentUser,
      text,
      likes: 0,
      isLiked: false,
      createdAt: 'Just now',
    };
    setComments(prev => [newComment, ...prev]);
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
      notifications,
      messages,
      toggleLike,
      toggleSave,
      toggleFollow,
      toggleCommentLike,
      addComment,
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
