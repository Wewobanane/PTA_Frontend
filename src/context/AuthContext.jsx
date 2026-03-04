import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../config/api';
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);
      
      // Validate response structure
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }

      // Backend returns: { success, message, data: { id, name, email, role, avatar, token } }
      const { data } = response.data;
      
      if (!data || !data.token || !data.role) {
        throw new Error('Invalid login response: missing required data');
      }

      // Extract user data (excluding token)
      const { token: authToken, ...userData } = data;

      // Store in localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);

      // Update state
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);

      // Navigate to role-based dashboard
      navigate(`/${userData.role}`);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  }, [navigate]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      console.log('Registering user with data:', { ...userData, password: '[HIDDEN]' });
      const response = await authAPI.register(userData);
      console.log('Registration response:', response.data);
      return {
        success: true,
        message: response.data.message || 'Registration successful',
      };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract detailed error message
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors) {
        // Handle validation errors array
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors.map(e => e.msg || e.message).join(', ');
        } else if (typeof errors === 'object') {
          errorMessage = Object.values(errors).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Try to call backend logout (will fail if token is invalid, but that's okay)
      await authAPI.logout();
      console.log('Logout successful');
    } catch (error) {
      // If logout fails (e.g., token expired), we still proceed with local cleanup
      console.log('Backend logout failed (expected if token expired):', error.response?.status);
    }
    
    // Always clear localStorage and state regardless of API call result
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');

    // Clear state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Navigate to login
    navigate('/login');
  }, [navigate]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const updatedUser = response.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Refresh user error:', error);
      return { success: false, error: 'Failed to refresh user data' };
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// No default export, only named exports for Vite HMR compatibility
