export interface TickerItem {
  id: string;
  text: string;
  imageUrl?: string;
  linkUrl?: string;
  tag?: string;
  isActive: boolean;
  createdAt: string;
}
