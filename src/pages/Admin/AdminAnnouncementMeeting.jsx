import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Paper,
} from '@mui/material';
import {
  Add,
  Refresh,
  Delete,
  Edit,
  Campaign,
  Event,
  CalendarToday,
  PushPin,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import { announcementAPI } from '../../config/api';

function AdminAnnouncementMeeting() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Announcements, 1 = Meetings
  const [announcements, setAnnouncements] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    targetAudience: 'all',
    isPinned: false,
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    type: 'staff',
    targetAudience: 'all',
    meetingDate: '',
    startTime: '',
    endTime: '',
    location: '',
  });

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

      setAnnouncements(announcementsRes.data?.data || []);
      setMeetings(meetingsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      if (!announcementForm.title || !announcementForm.content) {
        alert('Please fill in all required fields');
        return;
      }

      await announcementAPI.createAnnouncement(announcementForm);
      setCreateDialogOpen(false);
      setAnnouncementForm({
        title: '',
        content: '',
        category: 'general',
        priority: 'normal',
        targetAudience: 'all',
        isPinned: false,
      });
      fetchData();
      alert('Announcement created successfully!');
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement. Please try again.');
    }
  };

  const handleCreateMeeting = async () => {
    try {
      if (!meetingForm.title || !meetingForm.meetingDate || !meetingForm.startTime || !meetingForm.endTime) {
        alert('Please fill in all required fields');
        return;
      }

      await announcementAPI.createMeeting(meetingForm);
      setCreateDialogOpen(false);
      setMeetingForm({
        title: '',
        description: '',
        type: 'staff',
        targetAudience: 'all',
        meetingDate: '',
        startTime: '',
        endTime: '',
        location: '',
      });
      fetchData();
      alert('Meeting created successfully!');
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementAPI.deleteAnnouncement(id);
        fetchData();
        alert('Announcement deleted successfully!');
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Failed to delete announcement.');
      }
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await announcementAPI.deleteMeeting(id);
        fetchData();
        alert('Meeting deleted successfully!');
      } catch (error) {
        console.error('Error deleting meeting:', error);
        alert('Failed to delete meeting.');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'low': return 'info';
      default: return 'default';
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

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              📢 Announcements & Meetings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage announcements and PTA meetings
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton color="primary" onClick={fetchData}>
              <Refresh />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Create {activeTab === 0 ? 'Announcement' : 'Meeting'}
            </Button>
          </Box>
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
            // Announcements List
            announcements.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Campaign sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No announcements created yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {announcements.map((announcement) => (
                  <React.Fragment key={announcement._id}>
                    <ListItem
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        py: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
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
                              label={`For: ${announcement.targetAudience}`} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                            />
                            <Chip
                              label={formatDate(announcement.publishDate)}
                              size="small"
                              icon={<CalendarToday />}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteAnnouncement(announcement._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )
          ) : (
            // Meetings List
            meetings.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Event sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No meetings scheduled yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {meetings.map((meeting) => (
                  <React.Fragment key={meeting._id}>
                    <ListItem
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        py: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
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
                        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteMeeting(meeting._id)}
                          >
                            <Delete />
                          </IconButton>
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

        {/* Create Dialog */}
        <Dialog 
          open={createDialogOpen} 
          onClose={() => setCreateDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Create {activeTab === 0 ? 'Announcement' : 'Meeting'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {activeTab === 0 ? (
                // Announcement Form
                <>
                  <TextField
                    label="Title"
                    fullWidth
                    value={announcementForm.title}
                    onChange={(e) =>
                      setAnnouncementForm({ ...announcementForm, title: e.target.value })
                    }
                    required
                  />
                  <TextField
                    label="Content"
                    fullWidth
                    multiline
                    rows={4}
                    value={announcementForm.content}
                    onChange={(e) =>
                      setAnnouncementForm({ ...announcementForm, content: e.target.value })
                    }
                    required
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={announcementForm.category}
                          label="Category"
                          onChange={(e) =>
                            setAnnouncementForm({ ...announcementForm, category: e.target.value })
                          }
                        >
                          <MenuItem value="general">General</MenuItem>
                          <MenuItem value="academic">Academic</MenuItem>
                          <MenuItem value="event">Event</MenuItem>
                          <MenuItem value="holiday">Holiday</MenuItem>
                          <MenuItem value="urgent">Urgent</MenuItem>
                          <MenuItem value="examination">Examination</MenuItem>
                          <MenuItem value="sports">Sports</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={announcementForm.priority}
                          label="Priority"
                          onChange={(e) =>
                            setAnnouncementForm({ ...announcementForm, priority: e.target.value })
                          }
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="normal">Normal</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="urgent">Urgent</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <FormControl fullWidth>
                    <InputLabel>Target Audience</InputLabel>
                    <Select
                      value={announcementForm.targetAudience}
                      label="Target Audience"
                      onChange={(e) =>
                        setAnnouncementForm({ ...announcementForm, targetAudience: e.target.value })
                      }
                    >
                      <MenuItem value="all">Everyone</MenuItem>
                      <MenuItem value="parents">Parents Only</MenuItem>
                      <MenuItem value="teachers">Teachers Only</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="checkbox"
                        checked={announcementForm.isPinned}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })
                        }
                      />
                      <Typography>Pin this announcement (appears at top)</Typography>
                    </Box>
                  </FormControl>
                </>
              ) : (
                // Meeting Form
                <>
                  <TextField
                    label="Meeting Title"
                    fullWidth
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    required
                  />
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={meetingForm.description}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, description: e.target.value })
                    }
                  />
                  <FormControl fullWidth>
                    <InputLabel>Meeting Type</InputLabel>
                    <Select
                      value={meetingForm.type}
                      label="Meeting Type"
                      onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value })}
                    >
                      <MenuItem value="parent-teacher">Parent-Teacher</MenuItem>
                      <MenuItem value="staff">Staff Meeting</MenuItem>
                      <MenuItem value="class">Class Meeting</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Target Audience</InputLabel>
                    <Select
                      value={meetingForm.targetAudience}
                      label="Target Audience"
                      onChange={(e) => setMeetingForm({ ...meetingForm, targetAudience: e.target.value })}
                    >
                      <MenuItem value="all">All (Teachers & Parents)</MenuItem>
                      <MenuItem value="teachers">Teachers Only</MenuItem>
                      <MenuItem value="parents">Parents Only</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Meeting Date"
                    type="date"
                    fullWidth
                    value={meetingForm.meetingDate}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, meetingDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Start Time"
                        type="time"
                        fullWidth
                        value={meetingForm.startTime}
                        onChange={(e) =>
                          setMeetingForm({ ...meetingForm, startTime: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="End Time"
                        type="time"
                        fullWidth
                        value={meetingForm.endTime}
                        onChange={(e) =>
                          setMeetingForm({ ...meetingForm, endTime: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    label="Location"
                    fullWidth
                    value={meetingForm.location}
                    onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                    placeholder="e.g., School Hall, Room 101, or Online Meeting Link"
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={activeTab === 0 ? handleCreateAnnouncement : handleCreateMeeting}
            >
              Create {activeTab === 0 ? 'Announcement' : 'Meeting'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default AdminAnnouncementMeeting;
