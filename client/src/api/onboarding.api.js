import apiClient from './axios.config';

export const onboardingApi = {
  // Start new onboarding session
  startOnboarding: async () => {
    return apiClient.post('/onboarding/start');
  },
  
  // Get onboarding status
  getStatus: async (sessionId) => {
    return apiClient.get(`/onboarding/status/${sessionId}`);
  },
  
  // Save restaurant info
  saveRestaurantInfo: async (data) => {
    return apiClient.post('/onboarding/restaurant-info', data);
  },
  
  // Save menu setup
  saveMenuSetup: async (data) => {
    return apiClient.post('/onboarding/menu-setup', data);
  },
  
  // Save theme
  saveTheme: async (data) => {
    return apiClient.post('/onboarding/theme', data);
  },
  
  // Complete onboarding
  complete: async (sessionId) => {
    return apiClient.post('/onboarding/complete', { sessionId });
  },
};

export default onboardingApi;