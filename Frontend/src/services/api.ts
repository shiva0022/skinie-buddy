import axios, { AxiosError, AxiosResponse } from 'axios';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

interface User {
  id: string;
  name: string;
  email: string;
  skinType?: string;
  skinConcerns?: string[];
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  totalLogins?: number;
  achievements?: any[];
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  type: string;
  compatibility?: 'good' | 'warning' | 'error';
  usage?: string;
  ingredients?: string[];
  rating?: number;
  notes?: string;
}

interface Routine {
  _id: string;
  name: string;
  type: string;
  steps: RoutineStep[];
  isAIGenerated?: boolean;
  compatibilityWarnings?: string[];
}

interface RoutineStep {
  stepNumber: number;
  product: Product | string;
  instruction?: string;
  waitTime?: number;
}

interface ChatMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post<ApiResponse<{ user: User; token: string; streak: Streak }>>('/api/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await axiosInstance.post<ApiResponse<{ user: User; token: string; streak: Streak }>>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get<ApiResponse<{ user: User; streak: Streak }>>('/api/auth/me');
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await axiosInstance.put<ApiResponse>('/api/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await axiosInstance.get<ApiResponse<{ user: User; streak: Streak }>>('/api/users/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string; skinType?: string; skinConcerns?: string[]; preferences?: any }) => {
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>('/api/users/profile', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await axiosInstance.delete<ApiResponse>('/api/users/account');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async (filters?: { type?: string; isActive?: boolean; search?: string }) => {
    const response = await axiosInstance.get<ApiResponse<{ products: Product[] }>>('/api/products', {
      params: filters,
    });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<{ product: Product }>>(`/api/products/${id}`);
    return response.data;
  },

  create: async (productData: Partial<Product>) => {
    const response = await axiosInstance.post<ApiResponse<{ product: Product }>>('/api/products', productData);
    return response.data;
  },

  update: async (id: string, productData: Partial<Product>) => {
    const response = await axiosInstance.put<ApiResponse<{ product: Product }>>(`/api/products/${id}`, productData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse>(`/api/products/${id}`);
    return response.data;
  },
};

// Routines API
export const routinesAPI = {
  getAll: async (filters?: { type?: string; isActive?: boolean }) => {
    const response = await axiosInstance.get<ApiResponse<{ routines: Routine[] }>>('/api/routines', {
      params: filters,
    });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<{ routine: Routine }>>(`/api/routines/${id}`);
    return response.data;
  },

  create: async (routineData: Partial<Routine>) => {
    const response = await axiosInstance.post<ApiResponse<{ routine: Routine }>>('/api/routines', routineData);
    return response.data;
  },

  update: async (id: string, routineData: Partial<Routine>) => {
    const response = await axiosInstance.put<ApiResponse<{ routine: Routine }>>(`/api/routines/${id}`, routineData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse>(`/api/routines/${id}`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await axiosInstance.post<ApiResponse<{ routine: Routine }>>(`/api/routines/${id}/complete`);
    return response.data;
  },

  generateAI: async (type: 'morning' | 'night') => {
    const response = await axiosInstance.post<ApiResponse<{ routine: Routine }>>(
      '/api/routines/generate',
      { type },
      { timeout: 40000 } // 40 seconds timeout for AI generation
    );
    return response.data;
  },
};

// Streaks API
export const streaksAPI = {
  get: async () => {
    const response = await axiosInstance.get<ApiResponse<{ streak: Streak }>>('/api/streaks');
    return response.data;
  },

  update: async () => {
    const response = await axiosInstance.post<ApiResponse<{ streak: Streak }>>('/api/streaks/update');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  getHistory: async (limit = 50) => {
    const response = await axiosInstance.get<ApiResponse<{ messages: ChatMessage[] }>>('/api/chat/history', {
      params: { limit },
    });
    return response.data;
  },

  sendMessage: async (content: string) => {
    const response = await axiosInstance.post<ApiResponse<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>>(
      '/api/chat/message',
      { content },
      { timeout: 40000 } // 40 seconds timeout for AI chat responses
    );
    return response.data;
  },

  clearHistory: async () => {
    const response = await axiosInstance.delete<ApiResponse>('/api/chat/history');
    return response.data;
  },
};

// Export axios instance for custom requests
export default axiosInstance;
