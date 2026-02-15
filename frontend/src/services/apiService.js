import axios from 'axios'
import mockApi from './mockData'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      const hadToken = localStorage.getItem('token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (hadToken) {
        window.location.href = '/login?expired=1'
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

const apiService = {
  auth: {
    register: (data) =>
      useMocks ? mockApi.auth.register(data) : api.post('/auth/register', data),
    login: (data) =>
      useMocks ? mockApi.auth.login(data) : api.post('/auth/login', data),
    googleSignIn: (data) => api.post('/auth/google', data),
  },
  wantListings: {
    list: (params) =>
      useMocks ? mockApi.wantListings.list(params) : api.get('/want-listings', { params }),
    getMine: () =>
      useMocks ? mockApi.wantListings.getMine() : api.get('/want-listings/mine'),
    get: (id) =>
      useMocks ? mockApi.wantListings.get(id) : api.get(`/want-listings/${id}`),
    create: (data) =>
      useMocks ? mockApi.wantListings.create(data) : api.post('/want-listings', data),
    update: (id, data) =>
      useMocks ? mockApi.wantListings.update(id, data) : api.put(`/want-listings/${id}`, data),
    archive: (id) =>
      useMocks ? mockApi.wantListings.archive(id) : api.patch(`/want-listings/${id}/archive`),
  },
  vehicles: {
    list: (params) =>
      useMocks ? mockApi.vehicles.list(params) : api.get('/vehicles', { params }),
    getMine: () =>
      useMocks ? mockApi.vehicles.getMine() : api.get('/vehicles/mine'),
    get: (id) =>
      useMocks ? mockApi.vehicles.get(id) : api.get(`/vehicles/${id}`),
    create: (data) =>
      useMocks ? mockApi.vehicles.create(data) : api.post('/vehicles', data),
    update: (id, data) =>
      useMocks ? mockApi.vehicles.update(id, data) : api.put(`/vehicles/${id}`, data),
    uploadImage: (file) => {
      if (useMocks) return mockApi.vehicles.uploadImage(file)
      const formData = new FormData()
      formData.append('image', file)
      return api.post('/vehicles/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    getMatches: (vehicleId) =>
      useMocks ? mockApi.vehicles.getMatches(vehicleId) : api.get(`/vehicles/${vehicleId}/matches`),
  },
  introductions: {
    create: (data) =>
      useMocks ? mockApi.introductions.create(data) : api.post('/introductions', data),
    getReceived: (params) =>
      useMocks ? mockApi.introductions.getReceived(params) : api.get('/introductions/received', { params }),
    getSent: (params) =>
      useMocks ? mockApi.introductions.getSent(params) : api.get('/introductions/sent', { params }),
    accept: (id) =>
      useMocks ? mockApi.introductions.accept(id) : api.patch(`/introductions/${id}/accept`),
    reject: (id) =>
      useMocks ? mockApi.introductions.reject(id) : api.patch(`/introductions/${id}/reject`),
  },
  notifications: {
    getAll: () =>
      useMocks ? mockApi.notifications.getAll() : api.get('/notifications'),
    getUnreadCount: () =>
      useMocks ? mockApi.notifications.getUnreadCount() : api.get('/notifications/unread-count'),
    markRead: (id) =>
      useMocks ? mockApi.notifications.markRead(id) : api.patch(`/notifications/${id}/read`),
    markAllRead: () =>
      useMocks ? mockApi.notifications.markAllRead() : api.patch('/notifications/read-all'),
  },
  favorites: {
    list: () => api.get('/favorites'),
    add: (wantListingId) => api.post('/favorites', { wantListingId }),
    remove: (wantListingId) => api.delete(`/favorites/${wantListingId}`),
  },
  ai: {
    status: () => api.get('/ai/status'),
    chat: (messages) => api.post('/ai/chat', { messages }),
    extract: (messages) => api.post('/ai/extract', { messages }),
    extractFilters: (message) => api.post('/ai/extract-filters', { message }),
  },
  admin: {
    getUsers: (params) =>
      useMocks ? mockApi.admin.getUsers(params) : api.get('/admin/users', { params }),
    deleteUser: (id) =>
      useMocks ? mockApi.admin.deleteUser(id) : api.delete(`/admin/users/${id}`),
    getWantListings: (params) =>
      useMocks ? mockApi.admin.getWantListings(params) : api.get('/admin/want-listings', { params }),
    deleteWantListing: (id) =>
      useMocks ? mockApi.admin.deleteWantListing(id) : api.delete(`/admin/want-listings/${id}`),
    getVehicles: (params) =>
      useMocks ? mockApi.admin.getVehicles(params) : api.get('/admin/vehicles', { params }),
    deleteVehicle: (id) =>
      useMocks ? mockApi.admin.deleteVehicle(id) : api.delete(`/admin/vehicles/${id}`),
  },
}

export default apiService
