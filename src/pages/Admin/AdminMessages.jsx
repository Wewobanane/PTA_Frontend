import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
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
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Message as MessageIcon,
  Send,
  Inbox,
  Outbox,
  Refresh,
  Delete,
  Reply,
  Person,
  Close,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import { messageAPI } from '../../config/api';
import axios from 'axios';

function AdminMessages() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Inbox, 1 = Sent
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    message: '',
    priority: 'normal',
    category: 'general',
  });

  useEffect(() => {
    fetchMessages();
    fetchUsers();
    fetchUnreadCount();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const [inboxRes, sentRes] = await Promise.all([
        messageAPI.getMessages('received'),
        messageAPI.getMessages('sent'),
      ]);
      
      setInboxMessages(inboxRes.data?.data || []);
      setSentMessages(sentRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
      const token = localStorage.getItem('token');
      
      const [teachersRes, parentsRes] = await Promise.all([
        axios.get(`${API_URL}/users?role=teacher`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/users?role=parent`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      const teachers = teachersRes.data?.data || [];
      const parents = parentsRes.data?.data || [];
      setUsers([...teachers, ...parents]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await messageAPI.getUnreadCount();
      setUnreadCount(res.data?.data?.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!newMessage.recipient || !newMessage.subject || !newMessage.message) {
        alert('Please fill in all required fields');
        return;
      }

      await messageAPI.sendMessage(newMessage);
      setComposeOpen(false);
      setNewMessage({
        recipient: '',
        subject: '',
        message: '',
        priority: 'normal',
        category: 'general',
      });
      fetchMessages();
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    
    // Mark as read if it's in inbox and unread
    if (activeTab === 0 && !message.isRead) {
      try {
        await messageAPI.getMessageById(message._id);
        fetchMessages();
        fetchUnreadCount();
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleReply = (message) => {
    setNewMessage({
      recipient: message.sender._id,
      subject: `Re: ${message.subject}`,
      message: '',
      priority: 'normal',
      category: message.category || 'general',
    });
    setSelectedMessage(null);
    setComposeOpen(true);
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messageAPI.deleteMessage(messageId);
        fetchMessages();
        setSelectedMessage(null);
        alert('Message deleted successfully!');
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message.');
      }
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Helper to format name with student context
  const formatNameWithStudent = (user, student) => {
    if (!user) return 'Unknown';
    if (!student) return user.name; // No student context
    
    const studentName = `${student.firstName} ${student.lastName}`;
    
    if (user.role === 'parent') {
      return `${user.name} (${studentName}'s parent)`;
    } else if (user.role === 'teacher') {
      return `${user.name} (re: ${studentName})`;
    }
    
    return user.name;
  };

  const messages = activeTab === 0 ? inboxMessages : sentMessages;

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              💬 Messages
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Communicate with teachers and parents
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton color="primary" onClick={fetchMessages}>
              <Refresh />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => setComposeOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Compose Message
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Messages List */}
          <Grid item xs={12} md={selectedMessage ? 5 : 12}>
            <Card elevation={2}>
              <CardHeader
                title={
                  <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab 
                      icon={
                        <Badge badgeContent={unreadCount} color="error">
                          <Inbox />
                        </Badge>
                      } 
                      label="Inbox" 
                      iconPosition="start"
                    />
                    <Tab icon={<Outbox />} label="Sent" iconPosition="start" />
                  </Tabs>
                }
              />
              <Divider />

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <MessageIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No messages {activeTab === 0 ? 'received' : 'sent'} yet
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: '65vh', overflowY: 'auto', p: 0 }}>
                  {messages.map((msg) => (
                    <React.Fragment key={msg._id}>
                      <ListItem
                        button
                        selected={selectedMessage?._id === msg._id}
                        onClick={() => handleMessageClick(msg)}
                        sx={{
                          bgcolor: !msg.isRead && activeTab === 0 ? 'action.hover' : 'inherit',
                          '&.Mui-selected': {
                            bgcolor: 'primary.50',
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography 
                                variant="body1" 
                                sx={{ fontWeight: !msg.isRead && activeTab === 0 ? 600 : 400 }}
                              >
                                {activeTab === 0 
                                  ? formatNameWithStudent(msg.sender, msg.student)
                                  : formatNameWithStudent(msg.recipient, msg.student)
                                }
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(msg.createdAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{ 
                                  fontWeight: !msg.isRead && activeTab === 0 ? 600 : 400,
                                  display: 'block',
                                  mb: 0.5,
                                }}
                              >
                                {msg.subject}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <Chip 
                                  label={msg.priority} 
                                  size="small" 
                                  color={getPriorityColor(msg.priority)}
                                />
                                <Chip label={msg.category} size="small" variant="outlined" />
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Card>
          </Grid>

          {/* Message Detail */}
          {selectedMessage && (
            <Grid item xs={12} md={7}>
              <Card elevation={2}>
                <CardHeader
                  title={
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {selectedMessage.subject}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          label={selectedMessage.priority} 
                          size="small" 
                          color={getPriorityColor(selectedMessage.priority)}
                        />
                        <Chip label={selectedMessage.category} size="small" />
                      </Box>
                    </Box>
                  }
                  action={
                    <IconButton onClick={() => setSelectedMessage(null)}>
                      <Close />
                    </IconButton>
                  }
                />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {activeTab === 0 
                            ? formatNameWithStudent(selectedMessage.sender, selectedMessage.student)
                            : formatNameWithStudent(selectedMessage.recipient, selectedMessage.student)
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activeTab === 0 ? selectedMessage.sender?.email : selectedMessage.recipient?.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.message}
                  </Typography>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    {activeTab === 0 && (
                      <Button
                        variant="contained"
                        startIcon={<Reply />}
                        onClick={() => handleReply(selectedMessage)}
                      >
                        Reply
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(selectedMessage._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Compose Dialog */}
        <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Compose Message
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Recipient</InputLabel>
                <Select
                  value={newMessage.recipient}
                  label="Recipient"
                  onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                >
                  <MenuItem value="">Select recipient</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Subject"
                fullWidth
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                required
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={newMessage.priority}
                      label="Priority"
                      onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newMessage.category}
                      label="Category"
                      onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value })}
                    >
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="academic">Academic</MenuItem>
                      <MenuItem value="behavior">Behavior</MenuItem>
                      <MenuItem value="attendance">Attendance</MenuItem>
                      <MenuItem value="event">Event</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                label="Message"
                fullWidth
                multiline
                rows={6}
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<Send />} onClick={handleSendMessage}>
              Send Message
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default AdminMessages;
