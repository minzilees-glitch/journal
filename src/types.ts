export const TIME_PERIODS = ['새벽', '아침', '점심', '저녁', '밤'] as const;
export type TimePeriod = (typeof TIME_PERIODS)[number];

export const CATEGORIES = ['기도', '설교', '일반'] as const;
export type Category = (typeof CATEGORIES)[number];

export type TextBlock = {
  id: string;
  type: 'text';
  text: string;
};

export type PhotoBlock = {
  id: string;
  type: 'photo';
  uri: string;
};

export type ContentBlock = TextBlock | PhotoBlock;

export type Note = {
  id: string;
  dateKey: string;
  timePeriod: TimePeriod;
  category: Category;
  blocks: ContentBlock[];
  content: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
};
