import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import onboardingApi from '../api/onboarding.api';

const OnboardingContext = createContext();

const STEPS = [
  { id: 'welcome', label: 'Welcome', number: 1 },
  { id: 'restaurant_info', label: 'Restaurant Info', number: 2 },
  { id: 'menu_setup', label: 'Menu Setup', number: 3 },
  { id: 'theme_selection', label: 'Theme', number: 4 },
  { id: 'completion', label: 'Complete', number: 5 },
];

const initialState = {
  sessionId: null,
  currentStep: 'welcome',
  currentStepIndex: 0,
  completedSteps: [],
  isLoading: false,
  error: null,
  data: {
    restaurantInfo: {
      restaurantName: '',
      ownerName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      cuisineType: [],
      description: '',
    },
    menuSetup: {
      categories: [],
      sampleItems: false,
    },
    themeSettings: {
      theme: 'modern',
      primaryColor: '#0ea5e9',
      secondaryColor: '#22c55e',
      fontFamily: 'Inter',
      logo: null,
    },
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_SESSION':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        currentStep: action.payload.currentStep,
        completedSteps: action.payload.completedSteps,
        currentStepIndex: STEPS.findIndex(s => s.id === action.payload.currentStep),
        isLoading: false,
      };
    
    case 'UPDATE_RESTAURANT_INFO':
      return {
        ...state,
        data: {
          ...state.data,
          restaurantInfo: { ...state.data.restaurantInfo, ...action.payload },
        },
      };
    
    case 'UPDATE_MENU_SETUP':
      return {
        ...state,
        data: {
          ...state.data,
          menuSetup: { ...state.data.menuSetup, ...action.payload },
        },
      };
    
    case 'UPDATE_THEME':
      return {
        ...state,
        data: {
          ...state.data,
          themeSettings: { ...state.data.themeSettings, ...action.payload },
        },
      };
    
    case 'NEXT_STEP':
      const nextIndex = Math.min(state.currentStepIndex + 1, STEPS.length - 1);
      return {
        ...state,
        currentStep: STEPS[nextIndex].id,
        currentStepIndex: nextIndex,
        completedSteps: [...new Set([...state.completedSteps, state.currentStep])],
      };
    
    case 'PREV_STEP':
      const prevIndex = Math.max(state.currentStepIndex - 1, 0);
      return {
        ...state,
        currentStep: STEPS[prevIndex].id,
        currentStepIndex: prevIndex,
      };
    
    case 'GO_TO_STEP':
      const stepIndex = STEPS.findIndex(s => s.id === action.payload);
      if (stepIndex !== -1 && state.completedSteps.includes(action.payload)) {
        return {
          ...state,
          currentStep: action.payload,
          currentStepIndex: stepIndex,
        };
      }
      return state;
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
};

export const OnboardingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Start onboarding session
  const startOnboarding = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await onboardingApi.startOnboarding();
      dispatch({ type: 'SET_SESSION', payload: response.data });
      localStorage.setItem('onboarding_session', response.data.sessionId);
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);
  
  // Resume existing session
  const resumeSession = useCallback(async (sessionId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await onboardingApi.getStatus(sessionId);
      dispatch({ type: 'SET_SESSION', payload: response.data });
      
      // Restore data
      if (response.data.restaurantInfo) {
        dispatch({ type: 'UPDATE_RESTAURANT_INFO', payload: response.data.restaurantInfo });
      }
      if (response.data.menuSetup) {
        dispatch({ type: 'UPDATE_MENU_SETUP', payload: response.data.menuSetup });
      }
      if (response.data.themeSettings) {
        dispatch({ type: 'UPDATE_THEME', payload: response.data.themeSettings });
      }
      
      return response.data;
    } catch (error) {
      localStorage.removeItem('onboarding_session');
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);
  
  // Update restaurant info
  const updateRestaurantInfo = useCallback((data) => {
    dispatch({ type: 'UPDATE_RESTAURANT_INFO', payload: data });
  }, []);
  
  // Update menu setup
  const updateMenuSetup = useCallback((data) => {
    dispatch({ type: 'UPDATE_MENU_SETUP', payload: data });
  }, []);
  
  // Update theme
  const updateTheme = useCallback((data) => {
    dispatch({ type: 'UPDATE_THEME', payload: data });
  }, []);
  
  // Save and go to next step
  const nextStep = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { currentStep, sessionId, data } = state;
      
      // Save current step data
      if (currentStep === 'restaurant_info') {
        await onboardingApi.saveRestaurantInfo({
          sessionId,
          ...data.restaurantInfo,
        });
      } else if (currentStep === 'menu_setup') {
        await onboardingApi.saveMenuSetup({
          sessionId,
          ...data.menuSetup,
        });
      } else if (currentStep === 'theme_selection') {
        await onboardingApi.saveTheme({
          sessionId,
          ...data.themeSettings,
        });
      }
      
      dispatch({ type: 'NEXT_STEP' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [state]);
  
  // Go to previous step
  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);
  
  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await onboardingApi.complete(state.sessionId);
      localStorage.removeItem('onboarding_session');
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [state.sessionId]);
  
  // Reset onboarding
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('onboarding_session');
    dispatch({ type: 'RESET' });
  }, []);
  
  // Check for existing session on mount
  useEffect(() => {
    const existingSession = localStorage.getItem('onboarding_session');
    if (existingSession) {
      resumeSession(existingSession).catch(() => {
        // Session expired or invalid, start fresh
      });
    }
  }, [resumeSession]);
  
  const value = {
    ...state,
    steps: STEPS,
    startOnboarding,
    resumeSession,
    updateRestaurantInfo,
    updateMenuSetup,
    updateTheme,
    nextStep,
    prevStep,
    completeOnboarding,
    resetOnboarding,
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;