import React from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ChildCare as ChildCareIcon,
  Assignment as AssignmentIcon,
  EventAvailable as EventAvailableIcon,
  Message as MessageIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { path: '/parent/dashboard', label: 'Dashboard', icon: <DashboardIcon />, description: 'Overview' },
  { path: '/parent/messages', label: 'Messages', icon: <MessageIcon />, description: 'Teacher messages' },
  { path: '/parent/announcements-meetings', label: 'Announcements & Meetings', icon: <AssessmentIcon />, description: '📢 View announcements & meetings' },
  { path: '/parent/performance', label: 'Academic Performance', icon: <AssessmentIcon />, description: 'Grades & scores' },
  { path: '/parent/behaviors', label: 'Behavior History', icon: <AssignmentIcon />, description: 'Behavior logs' },
  { path: '/parent/attendance', label: 'Attendance', icon: <EventAvailableIcon />, description: 'Attendance records' },
  { path: '/parent/settings', label: 'Settings', icon: <SettingsIcon />, description: '⚙️ Account & Profile' },
];

function ParentSidebar({ mobileOpen, onDrawerToggle, onNavigation }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo/Brand Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
          }}
        >
          👨‍👩‍👧
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            PTA System
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Parent Portal
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, overflowY: 'auto', pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => onNavigation(item.path)}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'inherit' : 'action.active',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  secondaryTypographyProps={{
                    sx: { fontSize: '0.75rem', color: isActive ? 'rgba(255,255,255,0.7)' : 'text.secondary' },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="navigation menu"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

ParentSidebar.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  onDrawerToggle: PropTypes.func.isRequired,
  onNavigation: PropTypes.func.isRequired,
};

export default ParentSidebar;
