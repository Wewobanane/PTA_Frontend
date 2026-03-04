/**
 * Role-based access control utilities
 */

// Define role hierarchy (higher index = higher privilege)
export const ROLES = {
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

export const ROLE_HIERARCHY = [ROLES.PARENT, ROLES.TEACHER, ROLES.ADMIN];

/**
 * Check if user has required role
 * @param {string} userRole - Current user's role
 * @param {string} requiredRole - Required role to access resource
 * @returns {boolean} True if user has required role or higher
 */
export const hasRole = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  
  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
};

/**
 * Check if user has any of the specified roles
 * @param {string} userRole - Current user's role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean} True if user has any of the allowed roles
 */
export const hasAnyRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

/**
 * Check if user has exact role match
 * @param {string} userRole - Current user's role
 * @param {string} requiredRole - Required exact role
 * @returns {boolean} True if roles match exactly
 */
export const isExactRole = (userRole, requiredRole) => {
  return userRole === requiredRole;
};

/**
 * Get user permissions based on role
 * @param {string} role - User's role
 * @returns {Object} Permissions object
 */
export const getPermissions = (role) => {
  const permissions = {
    [ROLES.PARENT]: {
      canViewOwnChildren: true,
      canMessageTeachers: true,
      canViewReports: true,
      canManageUsers: false,
      canAccessAdmin: false,
    },
    [ROLES.TEACHER]: {
      canViewOwnChildren: false,
      canMessageTeachers: true,
      canViewReports: true,
      canManageStudents: true,
      canLogBehavior: true,
      canMarkAttendance: true,
      canManageUsers: false,
      canAccessAdmin: false,
    },
    [ROLES.ADMIN]: {
      canViewOwnChildren: false,
      canMessageTeachers: true,
      canViewReports: true,
      canManageStudents: true,
      canLogBehavior: true,
      canMarkAttendance: true,
      canManageUsers: true,
      canAccessAdmin: true,
      canManageSystem: true,
    },
  };

  return permissions[role] || {};
};

/**
 * Check if user has specific permission
 * @param {string} role - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (role, permission) => {
  const permissions = getPermissions(role);
  return permissions[permission] === true;
};

/**
 * Get accessible routes based on role
 * @param {string} role - User's role
 * @returns {string[]} Array of accessible route paths
 */
export const getAccessibleRoutes = (role) => {
  const routes = {
    [ROLES.PARENT]: ['/parent', '/parent/children', '/parent/messages', '/parent/reports'],
    [ROLES.TEACHER]: [
      '/teacher',
      '/teacher/classes',
      '/teacher/students',
      '/teacher/behavior',
      '/teacher/attendance',
      '/teacher/reports',
    ],
    [ROLES.ADMIN]: [
      '/admin',
      '/admin/users',
      '/admin/teachers',
      '/admin/parents',
      '/admin/students',
      '/admin/reports',
      '/admin/settings',
    ],
  };

  return routes[role] || [];
};

/**
 * Check if route is accessible for user role
 * @param {string} role - User's role
 * @param {string} route - Route path to check
 * @returns {boolean} True if route is accessible
 */
export const canAccessRoute = (role, route) => {
  const accessibleRoutes = getAccessibleRoutes(role);
  return accessibleRoutes.some((accessibleRoute) => route.startsWith(accessibleRoute));
};
