export interface User {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  avatar: {
    url: string;
    localPath: string;
  };
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  previousPage: boolean;
  nextPage: boolean;
  totalItems: number;
  currentPageItems: number;
}

export interface RandomUser {
  id: number;
  login: {
    uuid: string;
    username: string;
  };
  name: {
    first: string;
    last: string;
  };
  email: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  location: {
    city: string;
    country: string;
  };
}

export interface RandomProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  category: string;
  thumbnail: string;
  images: string[];
  instructor: Instructor;
  isBookmarked?: boolean;
  isEnrolled?: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
}
