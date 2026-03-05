import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Avatar,
  Chip,
  Badge,
  Paper,
  Grid,
  Divider,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Inbox,
  MarkEmailRead,
  Reply,
} from '@mui/icons-material';
import TeacherLayout from '../../components/layout/TeacherLayout';

function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);

  // TODO: Fetch messages from database
  useEffect(() => {
    // When backend message API is ready, fetch conversations here
    // For now, show empty state
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // TODO: Send message to API
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <TeacherLayout>
      <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            💬 Parent Messages
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Communicate with parents about student progress and behavior
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>🔐 How Messaging Works:</strong><br />
            • You never select parents manually<br />
            • Admin already linked student ↔ parent<br />
            • System auto-loads linked parent for each student<br />
            • Real-time chat - parents get instant notifications<br />
            <em>"I focus on teaching. System handles connections."</em>
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {/* Conversations List */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Inbox sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Conversations
                  </Typography>
                  <Badge
                    badgeContent={conversations.filter((c) => c.unread).length}
                    color="error"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {conversations.length === 0 ? (
                    <Alert severity="info">
                      No messages yet. Messages will appear here when parents contact you about their children.
                    </Alert>
                  ) : (
                    conversations.map((conversation) => (
                      <ListItem
                      key={conversation.id}
                      button
                      selected={selectedConversation?.id === conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        border: '1px solid',
                        borderColor: conversation.unread ? 'primary.main' : 'divider',
                        bgcolor: conversation.unread ? 'primary.light' : 'transparent',
                      }}
                    >
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {conversation.parent.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {conversation.parent}
                            </Typography>
                            {conversation.unread && (
                              <Badge color="error" variant="dot" />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" color="text.secondary">
                              Re: {conversation.student}
                            </Typography>
                            <Typography variant="body2" noWrap>
                              {conversation.lastMessage}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {conversation.time}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Message Thread */}
          <Grid size={{ xs: 12, md: 8 }}>
            {selectedConversation ? (
              <Card elevation={2} sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <CardContent sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {selectedConversation.parent.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {selectedConversation.parent}
                      </Typography>
                      <Chip
                        label={`Student: ${selectedConversation.student}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <IconButton sx={{ ml: 'auto' }}>
                      <MarkEmailRead />
                    </IconButton>
                  </Box>
                </CardContent>

                {/* Messages */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                  {selectedConversation.messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.from === 'teacher' ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor: message.from === 'teacher' ? 'primary.main' : 'grey.100',
                          color: message.from === 'teacher' ? 'white' : 'text.primary',
                        }}
                      >
                        <Typography variant="body1">{message.text}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            color: message.from === 'teacher' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                          }}
                        >
                          {message.time}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>

                {/* Input */}
                <CardContent sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      multiline
                      maxRows={3}
                    />
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card elevation={2} sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Inbox sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a conversation to view messages
                  </Typography>
                </Box>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </TeacherLayout>
  );
}

export default Messages;
