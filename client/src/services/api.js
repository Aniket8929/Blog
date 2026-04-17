import axios from 'axios';

const API_URL = 'https://blog-xxvj.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const userService = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  blockUser: (id, isBlocked) => api.put(`/users/${id}/block`, { isBlocked }),
  changeRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  getUserStats: (id) => api.get(`/users/${id}/stats`),
};

export const blogService = {
  createBlog: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'tags' && Array.isArray(data[key])) {
        data[key].forEach(tag => formData.append('tags', tag));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAllBlogs: (params) => api.get('/blogs', { params }),
  getBlogById: (id) => api.get(`/blogs/${id}`),
  updateBlog: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/blogs/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/blogs/${id}`, data);
  },
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  getMyBlogs: (params) => api.get('/blogs/my', { params }),
  getDrafts: () => api.get('/blogs/drafts'),
  getUserBlogs: (userId, params) => api.get(`/blogs/user/${userId}`, { params }),
  toggleLike: (id) => api.put(`/blogs/${id}/like`),
  toggleBookmark: (id) => api.put(`/blogs/${id}/bookmark`),
  getBookmarkedBlogs: (params) => api.get('/blogs/bookmarked', { params }),
  getCategories: () => api.get('/blogs/categories'),
  getTags: () => api.get('/blogs/tags'),
  getAdminStats: () => api.get('/blogs/admin/stats'),
};

export const commentService = {
  createComment: (data) => api.post('/comments', data),
  getBlogComments: (blogId, params) => api.get(`/comments/${blogId}`, { params }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export default api;