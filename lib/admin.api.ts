import { api } from './api'

export const adminApi = {
  // Users
  getUsers: (token: string, page = 1, limit = 50, search = '') =>
    api.get<any>(`/v1/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, token),
  
  getUserById: (id: string, token: string) =>
    api.get<any>(`/v1/admin/users/${id}`, token),
    
  blockUser: (id: string, token: string) =>
    api.patch<any>(`/v1/admin/users/${id}/block`, {}, token),
    
  deleteUserLgpd: (id: string, token: string) =>
    api.delete<any>(`/v1/admin/users/${id}/lgpd`, token),

  // Accounts
  getAccounts: (token: string, page = 1, limit = 50, search = '') =>
    api.get<any>(`/v1/admin/accounts?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, token),
    
  updateAccountStatus: (id: string, status: string, token: string) =>
    api.patch<any>(`/v1/admin/accounts/${id}/status`, { status }, token),
    
  deleteAccountLgpd: (id: string, token: string) =>
    api.delete<any>(`/v1/admin/accounts/${id}/lgpd`, token),

  updateOkxCredentials: (id: string, credentials: any, token: string) =>
    api.patch<any>(`/v1/admin/accounts/${id}/okx-credentials`, { credentials }, token),

  // Statements
  getStatements: (token: string, page = 1, limit = 50) =>
    api.get<any>(`/v1/admin/statements?page=${page}&limit=${limit}`, token),

  // Virtual Accounts
  getVirtualAccounts: (token: string, page = 1, limit = 50) =>
    api.get<any>(`/v1/admin/virtual-accounts?page=${page}&limit=${limit}`, token),
}
