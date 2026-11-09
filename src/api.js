// =============================================
// DriveGo Admin API client (web)
// =============================================
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.7:5000';

const request = async (path, method = 'GET', body = null, token = null) => {
  const headers = {};
  if (body !== null && body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== null && body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

// =====================
// Auth
// =====================
export const adminLogin = (email, password) =>
  request('/api/admin/login', 'POST', { email, password });

export const getAdminProfile = (token) =>
  request('/api/admin/profile', 'GET', null, token);

// =====================
// Dashboard
// =====================
export const getDashboard = (token) =>
  request('/api/admin/dashboard', 'GET', null, token);

// =====================
// Drivers
// =====================
export const getAdminDrivers = (params, token) => {
  const qs = Object.keys(params || {})
    .filter((k) => params[k])
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
  return request(`/api/admin/drivers${qs ? `?${qs}` : ''}`, 'GET', null, token);
};

export const getPendingDrivers = (token) =>
  request('/api/admin/pending-drivers', 'GET', null, token);

export const getDriverDetail = (id, token) =>
  request(`/api/admin/driver/${id}`, 'GET', null, token);

export const approveDriver = (id, token) =>
  request(`/api/admin/approve/${id}`, 'PUT', {}, token);

export const rejectDriver = (id, remarks, token) =>
  request(`/api/admin/reject/${id}`, 'PUT', { remarks }, token);

export const updateDriver = (id, data, token) =>
  request(`/api/admin/drivers/${id}`, 'PUT', data, token);

export const deleteDriver = (id, token) =>
  request(`/api/admin/drivers/${id}`, 'DELETE', null, token);

// =====================
// Booking update/delete
// =====================
export const updateBooking = (id, data, token) =>
  request(`/api/admin/bookings/${id}`, 'PUT', data, token);

// =====================
// Bookings
// =====================
export const getAdminBookings = (params, token) => {
  const qs = Object.keys(params || {})
    .filter((k) => params[k])
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
  return request(`/api/admin/bookings${qs ? `?${qs}` : ''}`, 'GET', null, token);
};

export const getBookingDetail = (id, token) =>
  request(`/api/admin/bookings/${id}`, 'GET', null, token);

export const deleteBooking = (id, token) =>
  request(`/api/admin/bookings/${id}`, 'DELETE', null, token);

// =====================
// Customers
// =====================
export const getAdminCustomers = (params, token) => {
  const qs = Object.keys(params || {})
    .filter((k) => params[k])
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
  return request(`/api/admin/customers${qs ? `?${qs}` : ''}`, 'GET', null, token);
};

export const getCustomerDetail = (id, token) =>
  request(`/api/admin/customers/${id}`, 'GET', null, token);

export const updateCustomer = (id, data, token) =>
  request(`/api/admin/customers/${id}`, 'PUT', data, token);

export const deleteCustomer = (id, token) =>
  request(`/api/admin/customers/${id}`, 'DELETE', null, token);

// =====================
// Config
// =====================
export const getAdminConfig = (token) =>
  request('/api/config', 'GET', null, token);

export const updateAdminConfig = (payload, token) =>
  request('/api/config', 'PUT', payload, token);

export default request;
export { API_BASE_URL };