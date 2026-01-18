import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token by getting current user
          const response = await authApi.getMe();
          dispatch({ type: 'SET_USER', payload: response.data });
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_USER', payload: null });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // Register
  const register = useCallback(async (data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.register(data);
      const { user, accessToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: user });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Login
  const login = useCallback(async (data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.login(data);
      const { user, accessToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: user });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API fails
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data) => {
    try {
      const response = await authApi.updateProfile(data);
      const updatedUser = response.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (data) => {
    try {
      const response = await authApi.updatePassword(data);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = {
    ...state,
    isInitialized,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;