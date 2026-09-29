export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  likes: number;
  isFollowing: boolean;
  isVerified: boolean;
}

export interface Post {
  id: string;
  user: User;
  type: 'video' | 'image';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  music?: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  tags: string[];
}

export interface Story {
  id: string;
  user: User;
  isViewed: boolean;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: User;
  text: string;
  postThumbnail?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Message {
  id: string;
  user: User;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

const avatarColors = ['#fe2c55', '#25f4ee', '#7c3aed', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#ef4444'];

function generateAvatar(seed: string): string {
  const color = avatarColors[seed.charCodeAt(0) % avatarColors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=${color.slice(1)}&color=fff&size=200&bold=true`;
}

export const currentUser: User = {
  id: 'current',
  username: 'you_vibe',
  displayName: 'Your Name',
  avatar: generateAvatar('You'),
  bio: '✨ Creating vibes | 🎬 Content creator\n📍 Everywhere',
  followers: 12400,
  following: 890,
  likes: 98200,
  isFollowing: false,
  isVerified: true,
};

export const users: User[] = [
  { id: '1', username: 'dance_queen', displayName: 'Sarah Dance', avatar: generateAvatar('Sarah'), bio: '💃 Professional dancer\n🎵 Choreographer', followers: 245000, following: 340, likes: 4500000, isFollowing: true, isVerified: true },
  { id: '2', username: 'foodie_mike', displayName: 'Mike Eats', avatar: generateAvatar('Mike'), bio: '🍕 Food explorer\n📸 Food photography', followers: 89000, following: 560, likes: 1200000, isFollowing: false, isVerified: false },
  { id: '3', username: 'travel_emma', displayName: 'Emma Travels', avatar: generateAvatar('Emma'), bio: '✈️ 50+ countries\n🌍 Travel tips & guides', followers: 567000, following: 230, likes: 8900000, isFollowing: true, isVerified: true },
  { id: '4', username: 'fitness_alex', displayName: 'Alex Fit', avatar: generateAvatar('Alex'), bio: '💪 Fitness coach\n🏋️ Daily workouts', followers: 123000, following: 445, likes: 2300000, isFollowing: false, isVerified: false },
  { id: '5', username: 'art_luna', displayName: 'Luna Art', avatar: generateAvatar('Luna'), bio: '🎨 Digital artist\n✨ Commissions open', followers: 345000, following: 189, likes: 5600000, isFollowing: true, isVerified: true },
  { id: '6', username: 'comedy_jake', displayName: 'Jake Funny', avatar: generateAvatar('Jake'), bio: '😂 Making you laugh\n🎭 Sketches daily', followers: 890000, following: 120, likes: 12000000, isFollowing: false, isVerified: true },
  { id: '7', username: 'music_aria', displayName: 'Aria Music', avatar: generateAvatar('Aria'), bio: '🎵 Singer/Songwriter\n🎸 Original music', followers: 456000, following: 310, likes: 6700000, isFollowing: true, isVerified: true },
  { id: '8', username: 'tech_sam', displayName: 'Sam Tech', avatar: generateAvatar('Sam'), bio: '💻 Tech reviews\n📱 Gadgets & gear', followers: 234000, following: 567, likes: 3400000, isFollowing: false, isVerified: false },
];

const videoThumbnails = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=700&fit=crop',
];

const imageUrls = [
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1682687221038-404670f09ef1?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop',
];

export const posts: Post[] = [
  {
    id: '1', user: users[0], type: 'video', mediaUrl: videoThumbnails[0], thumbnailUrl: videoThumbnails[0],
    caption: 'New dance challenge! 🔥 Who can do this? #dance #challenge #viral',
    music: '♪ Original Sound - dance_queen', likes: 45200, comments: 1230, shares: 5600, saves: 8900,
    isLiked: false, isSaved: false, createdAt: '2h ago', tags: ['dance', 'challenge', 'viral']
  },
  {
    id: '2', user: users[1], type: 'image', mediaUrl: imageUrls[0],
    caption: 'Best ramen in Tokyo 🍜 Recipe in bio! #food #tokyo #ramen',
    likes: 12300, comments: 456, shares: 890, saves: 3400,
    isLiked: true, isSaved: false, createdAt: '4h ago', tags: ['food', 'tokyo', 'ramen']
  },
  {
    id: '3', user: users[2], type: 'video', mediaUrl: videoThumbnails[2], thumbnailUrl: videoThumbnails[2],
    caption: 'Sunset in Bali hits different 🌅 #travel #bali #sunset #paradise',
    music: '♪ Sunflower - Post Malone', likes: 89000, comments: 2340, shares: 12000, saves: 15600,
    isLiked: false, isSaved: true, createdAt: '6h ago', tags: ['travel', 'bali', 'sunset']
  },
  {
    id: '4', user: users[3], type: 'image', mediaUrl: imageUrls[1],
    caption: 'Leg day done! 💪 Full workout routine on my profile #fitness #gym #workout',
    likes: 23400, comments: 780, shares: 1200, saves: 5600,
    isLiked: false, isSaved: false, createdAt: '8h ago', tags: ['fitness', 'gym', 'workout']
  },
  {
    id: '5', user: users[4], type: 'image', mediaUrl: imageUrls[2],
    caption: 'New digital art piece ✨ Took me 40 hours! #art #digital #creative',
    likes: 67800, comments: 1560, shares: 8900, saves: 12300,
    isLiked: true, isSaved: true, createdAt: '12h ago', tags: ['art', 'digital', 'creative']
  },
  {
    id: '6', user: users[5], type: 'video', mediaUrl: videoThumbnails[5], thumbnailUrl: videoThumbnails[5],
    caption: 'POV: Your mom calls you by your full name 😂 #comedy #funny #relatable',
    music: '♪ Oh No - Kreepa', likes: 234000, comments: 8900, shares: 45000, saves: 23000,
    isLiked: false, isSaved: false, createdAt: '1d ago', tags: ['comedy', 'funny', 'relatable']
  },
  {
    id: '7', user: users[6], type: 'image', mediaUrl: imageUrls[3],
    caption: 'New single dropping Friday! 🎵 Pre-save link in bio #music #newsingle #indie',
    likes: 45600, comments: 2100, shares: 6700, saves: 9800,
    isLiked: false, isSaved: false, createdAt: '1d ago', tags: ['music', 'newsingle', 'indie']
  },
  {
    id: '8', user: users[7], type: 'video', mediaUrl: videoThumbnails[7], thumbnailUrl: videoThumbnails[7],
    caption: 'iPhone 16 Pro review - Is it worth it? 📱 #tech #review #apple',
    music: '♪ Tech Beats - sam_tech', likes: 34500, comments: 1890, shares: 4500, saves: 7800,
    isLiked: false, isSaved: false, createdAt: '2d ago', tags: ['tech', 'review', 'apple']
  },
];

export const stories: Story[] = [
  { id: '1', user: currentUser, isViewed: false },
  { id: '2', user: users[0], isViewed: false },
  { id: '3', user: users[2], isViewed: false },
  { id: '4', user: users[4], isViewed: true },
  { id: '5', user: users[5], isViewed: false },
  { id: '6', user: users[6], isViewed: true },
  { id: '7', user: users[1], isViewed: false },
  { id: '8', user: users[3], isViewed: true },
  { id: '9', user: users[7], isViewed: false },
];

export const comments: Comment[] = [
  { id: '1', user: users[1], text: 'This is amazing! 🔥', likes: 234, isLiked: false, createdAt: '1h ago' },
  { id: '2', user: users[2], text: 'How do you do this?? 😍', likes: 89, isLiked: true, createdAt: '2h ago' },
  { id: '3', user: users[3], text: 'Tutorial please!! 🙏', likes: 456, isLiked: false, createdAt: '3h ago' },
  { id: '4', user: users[4], text: 'Obsessed with this 💕', likes: 123, isLiked: false, createdAt: '4h ago' },
  { id: '5', user: users[5], text: 'Made my day 😂', likes: 67, isLiked: true, createdAt: '5h ago' },
  { id: '6', user: users[6], text: 'Need this in my life!', likes: 345, isLiked: false, createdAt: '6h ago' },
  { id: '7', user: users[7], text: 'Sharing this with everyone', likes: 78, isLiked: false, createdAt: '7h ago' },
  { id: '8', user: users[0], text: 'Collab soon? 👀', likes: 890, isLiked: false, createdAt: '8h ago' },
];

export const notifications: Notification[] = [
  { id: '1', type: 'like', user: users[0], text: 'liked your post', postThumbnail: imageUrls[0], createdAt: '2m ago', isRead: false },
  { id: '2', type: 'follow', user: users[3], text: 'started following you', createdAt: '15m ago', isRead: false },
  { id: '3', type: 'comment', user: users[1], text: 'commented: "Amazing! 🔥"', postThumbnail: imageUrls[1], createdAt: '1h ago', isRead: false },
  { id: '4', type: 'like', user: users[4], text: 'liked your post', postThumbnail: imageUrls[2], createdAt: '2h ago', isRead: true },
  { id: '5', type: 'mention', user: users[5], text: 'mentioned you in a comment', postThumbnail: imageUrls[3], createdAt: '3h ago', isRead: true },
  { id: '6', type: 'follow', user: users[6], text: 'started following you', createdAt: '5h ago', isRead: true },
  { id: '7', type: 'like', user: users[2], text: 'liked your post', postThumbnail: imageUrls[4], createdAt: '8h ago', isRead: true },
  { id: '8', type: 'comment', user: users[7], text: 'commented: "Love this!"', postThumbnail: imageUrls[5], createdAt: '1d ago', isRead: true },
];

export const messages: Message[] = [
  { id: '1', user: users[0], lastMessage: 'Hey! Love your latest post 💕', timestamp: '2m', unread: 2 },
  { id: '2', user: users[2], lastMessage: 'Are you coming to the event?', timestamp: '1h', unread: 0 },
  { id: '3', user: users[4], lastMessage: 'Thanks for the collab! 🎨', timestamp: '3h', unread: 1 },
  { id: '4', user: users[5], lastMessage: '😂😂😂', timestamp: '5h', unread: 0 },
  { id: '5', user: users[6], lastMessage: 'Check out my new song!', timestamp: '1d', unread: 0 },
  { id: '6', user: users[1], lastMessage: 'That restaurant was amazing!', timestamp: '2d', unread: 0 },
];

export const explorePosts: Post[] = [
  ...posts,
  { id: '9', user: users[0], type: 'image', mediaUrl: imageUrls[4], caption: 'Beach vibes 🏖️', likes: 34500, comments: 890, shares: 2300, saves: 5600, isLiked: false, isSaved: false, createdAt: '3d ago', tags: ['beach', 'summer'] },
  { id: '10', user: users[3], type: 'image', mediaUrl: imageUrls[5], caption: 'Morning routine ☀️', likes: 12300, comments: 456, shares: 890, saves: 3400, isLiked: false, isSaved: false, createdAt: '3d ago', tags: ['morning', 'routine'] },
  { id: '11', user: users[5], type: 'image', mediaUrl: imageUrls[6], caption: 'New look! 💇', likes: 89000, comments: 3400, shares: 12000, saves: 8900, isLiked: false, isSaved: false, createdAt: '4d ago', tags: ['fashion', 'style'] },
  { id: '12', user: users[7], type: 'image', mediaUrl: imageUrls[7], caption: 'Setup tour 2024 🖥️', likes: 45600, comments: 1200, shares: 5600, saves: 7800, isLiked: false, isSaved: false, createdAt: '4d ago', tags: ['setup', 'tech'] },
  { id: '13', user: users[1], type: 'image', mediaUrl: imageUrls[8], caption: 'Street food adventure 🌮', likes: 23400, comments: 780, shares: 1200, saves: 4500, isLiked: false, isSaved: false, createdAt: '5d ago', tags: ['streetfood', 'adventure'] },
  { id: '14', user: users[4], type: 'image', mediaUrl: imageUrls[9], caption: 'Process video 🎬', likes: 67800, comments: 2100, shares: 8900, saves: 12300, isLiked: false, isSaved: false, createdAt: '5d ago', tags: ['process', 'art'] },
  { id: '15', user: users[6], type: 'image', mediaUrl: imageUrls[10], caption: 'Behind the scenes 🎤', likes: 34500, comments: 890, shares: 4500, saves: 6700, isLiked: false, isSaved: false, createdAt: '6d ago', tags: ['bts', 'music'] },
  { id: '16', user: users[2], type: 'image', mediaUrl: imageUrls[11], caption: 'Mountain views 🏔️', likes: 123000, comments: 4500, shares: 23000, saves: 34000, isLiked: false, isSaved: false, createdAt: '6d ago', tags: ['mountains', 'nature'] },
];

export const trendingTags = [
  { tag: 'dance', posts: '2.3M' },
  { tag: 'food', posts: '1.8M' },
  { tag: 'travel', posts: '3.1M' },
  { tag: 'fitness', posts: '1.5M' },
  { tag: 'art', posts: '980K' },
  { tag: 'comedy', posts: '4.2M' },
  { tag: 'music', posts: '2.7M' },
  { tag: 'tech', posts: '1.2M' },
];
