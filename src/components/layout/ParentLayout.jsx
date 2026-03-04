import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TopBar from '../Topbars/ParentTopbar';
import Sidebar from '../Sidebars/ParentSidebar';

const drawerWidth = 240;

function ParentLayout({ children }) {
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
        xl: 1366, // Limited for Parent - optimized for laptop/tablet screens
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
    
    // Navigate to a search results page or filter current view
    console.log('Searching for:', query);
    
    // You can implement search navigation here
    // For now, we'll just log it
    // In the future, you could navigate to a search results page:
    // navigate(`/parent/search?q=${encodeURIComponent(query)}`);
  }, [navigate]);

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
            pt: '64px', // Padding top to account for AppBar height
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

ParentLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ParentLayout;
