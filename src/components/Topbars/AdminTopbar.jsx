import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Box,
  Divider,
  ListItemText,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { messageAPI, announcementAPI } from '../../config/api';
import { useNavigate } from 'react-router-dom';


const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
    },
  },
}));

function AdminTopbar({
  onDrawerToggle,
  darkMode,
  onDarkModeChange,
  searchQuery,
  onSearchChange,
  onSearch,
}) {
  const navigate = useNavigate();
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const [unreadRes, messagesRes, announcementsRes, meetingsRes] = await Promise.all([
        messageAPI.getUnreadCount(),
        messageAPI.getMessages('received'),
        announcementAPI.getAnnouncements(),
        announcementAPI.getMeetings(),
      ]);
      
      const unreadMessagesCount = unreadRes.data?.data?.count || 0;
      
      // Get recent messages (unread only)
      const recentMessages = (messagesRes.data?.data || [])
        .filter(msg => !msg.isRead)
        .slice(0, 5)
        .map(msg => ({
          id: msg._id,
          type: 'message',
          title: msg.subject || 'New message',
          message: msg.message?.substring(0, 60) + '...',
          from: msg.sender?.name || 'Unknown',
          time: formatTimeAgo(msg.createdAt),
          unread: true,
          itemId: msg._id,
        }));
      
      // Get recent announcements (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentAnnouncements = (announcementsRes.data?.data || [])
        .filter(ann => new Date(ann.createdAt) > sevenDaysAgo && ann.isActive)
        .slice(0, 5)
        .map(ann => ({
          id: ann._id,
          type: 'announcement',
          title: '📢 ' + ann.title,
          message: ann.content?.substring(0, 60) + '...',
          from: ann.author?.name || 'Admin',
          time: formatTimeAgo(ann.createdAt),
          unread: true,
          itemId: ann._id,
        }));
      
      // Get upcoming meetings (next 14 days)
      const fourteenDaysLater = new Date();
      fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
      const now = new Date();
      
      const upcomingMeetings = (meetingsRes.data?.data || [])
        .filter(meeting => {
          const meetingDate = new Date(meeting.meetingDate);
          return meetingDate >= now && meetingDate <= fourteenDaysLater && meeting.status === 'scheduled';
        })
        .slice(0, 5)
        .map(meeting => ({
          id: meeting._id,
          type: 'meeting',
          title: '📅 ' + meeting.title,
          message: `${new Date(meeting.meetingDate).toLocaleDateString()} at ${meeting.startTime}`,
          from: meeting.organizer?.name || 'Organizer',
          time: formatTimeAgo(meeting.createdAt),
          unread: true,
          itemId: meeting._id,
        }));
      
      // Combine all notifications and sort by date
      const allNotifications = [...recentMessages, ...recentAnnouncements, ...upcomingMeetings]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);
      
      setUnreadCount(unreadMessagesCount + recentAnnouncements.length + upcomingMeetings.length);
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  const handleNotificationClick = (notification) => {
    setNotifAnchor(null);
    if (notification.type === 'message') {
      navigate('/admin/messages');
    } else if (notification.type === 'announcement' || notification.type === 'meeting') {
      navigate('/admin/announcements-meetings');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchQuery);
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
      elevation={1}
    >
      <Toolbar>
        {/* Menu Toggle */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            Admin Dashboard 👨‍💼
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getCurrentDate()}
          </Typography>
        </Box>

        {/* Search */}
        <Search sx={{ display: { xs: 'none', md: 'flex' } }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search users, reports..."
            inputProps={{ 'aria-label': 'search' }}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
        </Search>

        {/* Notifications */}
        <IconButton
          color="inherit"
          onClick={(e) => setNotifAnchor(e.currentTarget)}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          PaperProps={{
            sx: { width: 360, maxHeight: 480 },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Notifications ({unreadCount})
            </Typography>
            {unreadCount > 0 && (
              <IconButton size="small" onClick={handleMarkAllRead} title="Refresh">
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Divider />
          {loadingNotifications ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <MenuItem
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                sx={{ 
                  bgcolor: notif.unread ? 'action.hover' : 'transparent',
                  whiteSpace: 'normal',
                  py: 1.5,
                }}
              >
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: notif.unread ? 'bold' : 'normal' }}>
                        {notif.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        From: {notif.from}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {notif.message}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="primary">
                        {notif.time}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
            ))
          )}
          <Divider />
          <MenuItem 
            sx={{ justifyContent: 'center' }}
            onClick={() => {
              setNotifAnchor(null);
              navigate('/admin/messages');
            }}
          >
            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
              View all
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

AdminTopbar.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  onDarkModeChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default AdminTopbar;
