import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  Chip,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Refresh,
  Campaign,
  Event,
  CalendarToday,
  PushPin,
} from '@mui/icons-material';
import { announcementAPI } from '../../config/api';
import TeacherLayout from '../../components/layout/TeacherLayout';

const TeacherAnnouncementsMeetings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [announcementsRes, meetingsRes] = await Promise.all([
        announcementAPI.getAnnouncements(),
        announcementAPI.getMeetings(),
      ]);
      
      // Backend now handles targetAudience filtering
      setAnnouncements(announcementsRes.data?.data || []);
      setMeetings(meetingsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <TeacherLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              📢 Announcements & Meetings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with school announcements and scheduled meetings
            </Typography>
          </Box>
          <IconButton color="primary" onClick={fetchData}>
            <Refresh />
          </IconButton>
        </Box>

        <Card elevation={2}>
          <CardHeader
            title={
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <Tab icon={<Campaign />} label="Announcements" iconPosition="start" />
                <Tab icon={<Event />} label="Meetings" iconPosition="start" />
              </Tabs>
            }
          />
          <Divider />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : activeTab === 0 ? (
            announcements.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Campaign sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No announcements available
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {announcements.map((announcement) => (
                  <React.Fragment key={announcement._id}>
                    <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', py: 2 }}>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {announcement.isPinned && (
                            <PushPin sx={{ fontSize: 18, color: 'primary.main' }} />
                          )}
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {announcement.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {announcement.content}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={announcement.priority}
                            size="small"
                            color={getPriorityColor(announcement.priority)}
                          />
                          <Chip label={announcement.category} size="small" variant="outlined" />
                          <Chip
                            label={formatDate(announcement.publishDate)}
                            size="small"
                            icon={<CalendarToday />}
                          />
                        </Box>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )
          ) : (
            meetings.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Event sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No meetings scheduled
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {meetings.map((meeting) => (
                  <React.Fragment key={meeting._id}>
                    <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', py: 2 }}>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {meeting.title}
                        </Typography>
                        {meeting.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {meeting.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={formatDateTime(meeting.meetingDate)}
                            size="small"
                            icon={<CalendarToday />}
                            color="primary"
                          />
                          <Chip
                            label={`${meeting.startTime} - ${meeting.endTime}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip label={meeting.type} size="small" variant="outlined" />
                          <Chip 
                            label={`For: ${meeting.targetAudience || 'all'}`} 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                          />
                          {meeting.location && (
                            <Chip label={meeting.location} size="small" variant="outlined" />
                          )}
                          <Chip
                            label={meeting.status}
                            size="small"
                            color={meeting.status === 'scheduled' ? 'success' : 'default'}
                          />
                        </Box>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )
          )}
        </Card>
      </Box>
    </TeacherLayout>
  );
};

export default TeacherAnnouncementsMeetings;
