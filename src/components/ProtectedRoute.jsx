import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasAnyRole } from '../utils/roleGuard';
import { CircularProgress, Box } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Protected Route Component - Restricts access based on authentication and roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectTo - Path to redirect if unauthorized
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Prevent redirect loop when already on login page
    if (location.pathname !== redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return null;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !hasAnyRole(user?.role, allowedRoles)) {
    const userDashboard = `/${user.role}`;
    
    // Prevent infinite loop: only redirect if not already on target path
    if (location.pathname !== userDashboard && !location.pathname.startsWith(userDashboard + '/')) {
      return <Navigate to={userDashboard} replace />;
    }
    // If already on the dashboard path but still unauthorized, allow it (shouldn't happen)
    return null;
  }

  // User is authenticated and has required role
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  redirectTo: PropTypes.string,
};

export default ProtectedRoute;
