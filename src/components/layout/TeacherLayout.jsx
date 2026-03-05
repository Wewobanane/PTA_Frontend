import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import { Devices } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import TopBar from '../Topbars/TeacherTopbar';
import Sidebar from '../Sidebars/TeacherSidebar';
import SearchDialog from '../shared/SearchDialog';

const drawerWidth = 240;
const MIN_SCREEN_WIDTH = 375; // Phone minimum for Teacher

function TeacherLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(window.innerWidth < MIN_SCREEN_WIDTH);
  const navigate = useNavigate();

  // Check screen size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setIsScreenTooSmall(window.innerWidth < MIN_SCREEN_WIDTH);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme configuration - Teacher: Phone, Tablet, Laptop, Monitor
  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2e7d32',
      },
    },
    breakpoints: {
      values: {
        xs: 375,    // Phone
        sm: 768,    // Tablet
        md: 1024,   // Laptop
        lg: 1440,   // Monitor
        xl: 1920,   // Large Monitor
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            transition: 'width 0.3s ease-in-out',
          },
        },
      },
    },
  });

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Search handler
  const handleSearch = useCallback((query) => {
    if (!query.trim()) return;
    setSearchDialogOpen(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Show screen size warning for Teacher on very small screens
  if (isScreenTooSmall) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 2,
          }}
        >
          <Container maxWidth="sm">
            <Paper elevation={6} sx={{ p: 3, textAlign: 'center' }}>
              <Devices sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Screen Too Small
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Teacher Portal requires a minimum screen width of 375px.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Please use a device with a larger screen.
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.disabled' }}>
                Current width: {window.innerWidth}px
              </Typography>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <TopBar
          onDrawerToggle={handleDrawerToggle}
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />

        <Sidebar
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
          onNavigation={handleNavigation}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 2, md: 3 },
            pt: { xs: '72px', sm: '80px', md: '80px' },
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100vh',
            width: { xs: '100%', sm: '100%', md: `calc(100% - ${drawerWidth}px)` },
          }}
          aria-label="Main content"
        >
          {children}
        </Box>

        <SearchDialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
          userRole="teacher"
          initialQuery={searchQuery}
        />
      </Box>
    </ThemeProvider>
  );
}

TeacherLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TeacherLayout;
