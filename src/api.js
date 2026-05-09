const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';

/**
 * Base request function to handle fetch and token injection
 */
async function request(endpoint, method = 'GET', data = null, overrideUserId = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    const currentUserId = overrideUserId || user.userId || user.userid;
    if (currentUserId != null) {
      headers['x-user-id'] = currentUserId.toString();
      headers['userId'] = currentUserId.toString(); // Added to match the .NET parameter name
    }
    if (user.username) {
      headers['x-username'] = user.username;
    }
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    // Treat 404 on GET requests as "no data" instead of throwing an error
    if (method === 'GET' && response.status === 404) {
      return null;
    }

    const errorText = await response.text();
    throw new Error(errorText || `HTTP Error ${response.status}`);
  }
  
  // Explicitly handle 204 No Content so it doesn't return an empty string
  if (response.status === 204) {
    return null;
  }

  // Handle empty responses or plain text (like the register endpoint)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

// --- 2. Identity Service ---
export const registerUser = (username, password) => request('/identity/register', 'POST', { username, password });
export const loginUser = (username, password) => request('/identity/login', 'POST', { username, password });
export const updateUserRole = (username, role) => request(`/identity/users/${username}/role`, 'PUT', { role });

// --- 3. Event Service ---
export const createEvent = (eventData) => request('/events', 'POST', eventData);
export const getUpcomingEvents = (userId) => request('/events/upcoming', 'GET', null, userId);
export const getAttendedEvents = (userId) => request('/events/attended', 'GET', null, userId);

// --- 4. Garage Service ---
export const addMotorcycle = (motorcycleData) => request('/garage/motorcycles', 'POST', motorcycleData);
export const getMotorcycles = () => request('/garage/motorcycles', 'GET');
export const getCatalog = () => request('/garage/catalog', 'GET');

// --- 5. Maintenance Service ---
export const addMaintenanceLog = (logData) => request('/maintenance/logs', 'POST', logData);
export const getMaintenanceLogs = (motorcycleId) => request(`/maintenance/logs/${motorcycleId}`, 'GET');
export const getSafetyStatus = (motorcycleId) => request(`/maintenance/status/${motorcycleId}`, 'GET');

// --- 6. Clubs Service ---
export const getClubMembers = () => request('/clubs/members', 'GET');
export const inviteClubMember = (memberData) => request('/clubs/members', 'POST', memberData);
export const removeClubMember = (memberId) => request(`/clubs/members/${memberId}`, 'DELETE');
export const createClub = (clubData) => request('/clubs', 'POST', clubData);
export const getMyClubs = () => request('/clubs', 'GET');
export const updateMemberSafety = (safetyData) => request('/clubs/members/safety', 'PUT', safetyData);
export const acceptClubInvite = (clubId, safetyData) => request(`/clubs/${clubId}/accept`, 'PUT', safetyData);
export const leaveClub = (clubId) => request(`/clubs/${clubId}/leave`, 'DELETE');