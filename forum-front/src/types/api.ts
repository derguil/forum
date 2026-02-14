export type Id = string;

export type ApiSuccess = {
  success: boolean;
  message?: string;
};

export type ProfileImage = {
  img_key: string;
  img_URL: string;
};

export type UserPublic = {
  _id: Id;
  username: string;
  email?: string;
  profileImg?: ProfileImage;
  scrapPosts?: Id[];
  createdAt?: string;
};

export type Forum = {
  _id: Id;
  title: string;
  madeby?: Id;
};

export type PostImage = {
  img_key?: string;
  img_URL: string;
};

export type PostBase = {
  _id: Id;
  parent_id: Id;
  title: string;
  content: string;
  images?: PostImage[];
  wtime: string;
  wby: Id;
  commentCount: number;
  voteCount: number;
  scrapCount: number;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
};

export type PostListItem = PostBase & {
  forum?: { title: string };
  written?: { username?: string };
};

export type PostDetail = PostBase & {
  written?: UserPublic;
};

export type Comment = {
  _id: Id;
  parent_id: Id;
  comment: string;
  wtime: string;
  wby: Id;
  isDeleted: boolean;
  deletedAt?: string | null;
  written?: UserPublic;
};

export type ThreadPreview = {
  _id: Id;
  forum_id: Id;
  post_id: Id;
  members?: Id[];
  lastMessage: string | null;
  createdAt: string;
  updatedAt: string;
  myUnreadCount: number;
  otherUser: UserPublic;
};

export type ChatMessage = {
  _id: Id;
  thread_id: Id;
  text: string;
  sent: Id;
  createdAt: string;
  type?: "me" | "other";
};

export type ReqForumsResponse = {
  success: boolean;
  forums: Forum[];
};

export type ReqForumResponse = {
  success: boolean;
  forum: Forum;
};

export type ReqPostsResponse = {
  success: boolean;
  posts: PostListItem[];
  totalPostsCount: number;
};

export type ReqPostResponse = {
  success: boolean;
  post: PostDetail;
  isScrapped: boolean;
};

export type ReqCommentsResponse = {
  success: boolean;
  comments: Comment[];
};

export type ReqThreadsResponse = {
  success: boolean;
  threads: ThreadPreview[];
};

export type ReqMessagesResponse = {
  success: boolean;
  threadChats: ChatMessage[];
};

export type ThreadCreateResponse = {
  threadId: Id;
  isNew: boolean;
};

export type TrendPostsResponse = {
  success: boolean;
  trendposts: PostListItem[];
};
