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
import TopBar from '../Topbars/ParentTopbar';
import Sidebar from '../Sidebars/ParentSidebar';
import SearchDialog from '../shared/SearchDialog';

const drawerWidth = 240;
const MIN_SCREEN_WIDTH = 320; // Small phone minimum for Parent

function ParentLayout({ children }) {
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

  // Theme configuration - Parent: Full mobile support (Small Phone, Phone, Tablet, Laptop, Monitor)
  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2e7d32',
      },
    },
    breakpoints: {
      values: {
        xs: 320,    // Small Phone
        sm: 600,    // Phone/Large Phone
        md: 900,    // Tablet
        lg: 1200,   // Laptop
        xl: 1920,   // Monitor/Desktop
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

  // Show screen size warning for Parent on extremely small screens
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
            p: 1.5,
          }}
        >
          <Container maxWidth="xs">
            <Paper elevation={6} sx={{ p: 2.5, textAlign: 'center' }}>
              <Devices sx={{ fontSize: 48, color: 'primary.main', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Screen Too Small
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                Parent Portal requires a minimum screen width of 320px.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Please rotate your device or use a larger screen.
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1.5, color: 'text.disabled', fontSize: '0.65rem' }}>
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
            p: { xs: 0.5, sm: 1.5, md: 2, lg: 3 },
            pt: { xs: '68px', sm: '72px', md: '80px' },
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100vh',
            width: { xs: '100%', sm: '100%', md: '100%', lg: `calc(100% - ${drawerWidth}px)` },
          }}
          aria-label="Main content"
        >
          {children}
        </Box>

        <SearchDialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
          userRole="parent"
          initialQuery={searchQuery}
        />
      </Box>
    </ThemeProvider>
  );
}

ParentLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ParentLayout;
