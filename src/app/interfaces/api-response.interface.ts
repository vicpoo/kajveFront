export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page?: number;
  skip?: number;
  limit: number;
  items: T[];
}