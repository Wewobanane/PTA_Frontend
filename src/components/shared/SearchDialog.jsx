import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  InputAdornment,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function SearchDialog({ open, onClose, userRole, searchAPI, initialQuery = '' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Set initial query when dialog opens
  useEffect(() => {
    if (open && initialQuery) {
      setQuery(initialQuery);
    }
  }, [open, initialQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await performSearch(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase();
    const mockResults = [];

    // Define search categories based on user role
    if (userRole === 'admin') {
      // Search in navigation items
      const adminPages = [
        { type: 'page', title: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
        { type: 'page', title: 'Teachers', path: '/admin/teachers', icon: 'person' },
        { type: 'page', title: 'Parents', path: '/admin/parents', icon: 'person' },
        { type: 'page', title: 'Academic Year Management', path: '/admin/academic-years', icon: 'school' },
        { type: 'page', title: 'Messages', path: '/admin/messages', icon: 'email' },
        { type: 'page', title: 'Announcements & Meetings', path: '/admin/announcements-meetings', icon: 'event' },
        { type: 'page', title: 'Settings', path: '/admin/settings', icon: 'settings' },
      ];

      adminPages.forEach(page => {
        if (page.title.toLowerCase().includes(lowerQuery)) {
          mockResults.push(page);
        }
      });
    } else if (userRole === 'teacher') {
      const teacherPages = [
        { type: 'page', title: 'Dashboard', path: '/teacher/dashboard', icon: 'dashboard' },
        { type: 'page', title: 'My Classes', path: '/teacher/classes', icon: 'school' },
        { type: 'page', title: 'Attendance', path: '/teacher/attendance', icon: 'check' },
        { type: 'page', title: 'Assessments', path: '/teacher/assessments', icon: 'assignment' },
        { type: 'page', title: 'Behaviors', path: '/teacher/behaviors', icon: 'star' },
        { type: 'page', title: 'Messages', path: '/teacher/messages', icon: 'email' },
        { type: 'page', title: 'Announcements & Meetings', path: '/teacher/announcements-meetings', icon: 'event' },
        { type: 'page', title: 'Settings', path: '/teacher/settings', icon: 'settings' },
      ];

      teacherPages.forEach(page => {
        if (page.title.toLowerCase().includes(lowerQuery)) {
          mockResults.push(page);
        }
      });
    } else if (userRole === 'parent') {
      const parentPages = [
        { type: 'page', title: 'Dashboard', path: '/parent/dashboard', icon: 'dashboard' },
        { type: 'page', title: 'Child Details', path: '/parent/child-details', icon: 'person' },
        { type: 'page', title: 'Academic Performance', path: '/parent/academic-performance', icon: 'school' },
        { type: 'page', title: 'Attendance Records', path: '/parent/attendance', icon: 'check' },
        { type: 'page', title: 'Behavior History', path: '/parent/behavior', icon: 'star' },
        { type: 'page', title: 'Messages', path: '/parent/messages', icon: 'email' },
        { type: 'page', title: 'Announcements & Meetings', path: '/parent/announcements-meetings', icon: 'event' },
        { type: 'page', title: 'Settings', path: '/parent/settings', icon: 'settings' },
      ];

      parentPages.forEach(page => {
        if (page.title.toLowerCase().includes(lowerQuery)) {
          mockResults.push(page);
        }
      });
    }

    return mockResults;
  };

  const handleResultClick = (result) => {
    navigate(result.path);
    onClose();
    setQuery('');
    setResults([]);
  };

  const handleClose = () => {
    onClose();
    setQuery('');
    setResults([]);
  };

  const getIconComponent = (iconName) => {
    const icons = {
      person: <PersonIcon />,
      school: <SchoolIcon />,
      email: <EmailIcon />,
      event: <EventIcon />,
      announcement: <AnnouncementIcon />,
    };
    return icons[iconName] || <SearchIcon />;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: 80,
          m: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Search</Typography>
          <Chip
            label="Press ESC to close"
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder={`Search ${userRole === 'admin' ? 'users, pages...' : userRole === 'teacher' ? 'students, classes, pages...' : 'children, pages...'}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {query.trim() && (
          <>
            {results.length > 0 ? (
              <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {results.map((result, index) => (
                  <React.Fragment key={index}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleResultClick(result)}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {getIconComponent(result.icon)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={result.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={result.type}
                                size="small"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {result.path}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < results.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : !loading && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No results found for "{query}"
                </Typography>
              </Box>
            )}
          </>
        )}

        {!query.trim() && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Start typing to search...
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

SearchDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userRole: PropTypes.oneOf(['admin', 'teacher', 'parent']).isRequired,
  searchAPI: PropTypes.object,
  initialQuery: PropTypes.string,
};

export default SearchDialog;
