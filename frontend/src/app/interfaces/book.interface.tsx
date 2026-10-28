export interface UserRef {
  _id: string;
  fullName: string;
}

export interface Book {
  title: string;
  author: string;
  category_id: string;
  category_name: string;
  description: string;
  priceBuy: number;
  inStock?: number;
  rating: number;
  reviews: number;
  image: string;
  status: string;
  featured: boolean;
  readerFavorite?: boolean;
  topChartPosition?: number;
  flashSale?: boolean;
  discountPercent?: number;
  flashSaleEndAt?: string;
  position: number;
  deleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  slug: string;
  _id: string;
  createdBy: UserRef;
  deletedBy: UserRef;
  updatedBy: UserRef;
  newest: boolean;
  soldCount: number;
}
