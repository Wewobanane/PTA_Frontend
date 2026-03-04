import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TopBar from '../Topbars/TeacherTopbar';
import Sidebar from '../Sidebars/TeacherSidebar';

const drawerWidth = 240;

function TeacherLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Theme configuration
  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2e7d32',
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1366, // Limited for Teacher - optimized for laptop screens
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
    console.log('Searching for:', query);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', maxWidth: '1366px', margin: '0 auto' }}>
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
            p: 0,
            pt: '24px', // Padding top to account for AppBar height
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100vh',
            width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          }}
          aria-label="Main content"
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

TeacherLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TeacherLayout;
