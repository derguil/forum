export type ProfileImage = {
  img_key: string;
  img_URL: string;
};

export type User = {
  _id: string;
  username: string;
  email: string;
  profileImg: ProfileImage;
  createdAt: string;
  scrapPosts: string[];
};
