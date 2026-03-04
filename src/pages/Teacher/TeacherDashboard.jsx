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
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  School,
  Class as ClassIcon,
  CheckCircle,
  Assignment,
  EventAvailable,
  Message,
  BarChart,
  Add,
  TrendingUp,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import TeacherLayout from '../../components/layout/TeacherLayout';
import { behaviorAPI, authAPI, teacherAPI } from '../../config/api';
import { useApi } from '../../hooks/useApi';
import TeacherProfileForm from './TeacherProfileForm';

function TeacherDashboard() {
  const navigate = useNavigate();
  const { request, loading, error } = useApi();
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [stats, setStats] = useState({
    assignedClasses: 0,
    totalStudents: 0,
    recentBehaviors: 0,
    newMessages: 0,
    attendanceRate: 0,
  });

  const [myClasses, setMyClasses] = useState([]);
  const [recentBehaviors, setRecentBehaviors] = useState([]);
  const [newMessages, setNewMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const teacherResult = await request(authAPI.getCurrentUser);
      if (teacherResult.success && teacherResult.data?.data) {
        const teacher = teacherResult.data.data;
        setTeacherProfile(teacher);

        const classroomsResult = await request(teacherAPI.getClassrooms);
        if (classroomsResult.success && classroomsResult.data?.data) {
          const classrooms = classroomsResult.data.data;
          const classesArray = classrooms.map(c => ({
            id: c.academicYearId,
            name: `${c.yearName} · ${c.termLabel} · ${c.classLevel}`,
            yearName: c.yearName,
            termLabel: c.termLabel,
            classLevel: c.classLevel,
            students: c.studentCount,
            subject: teacher.subject || 'Not assigned',
          }));
          setMyClasses(classesArray);
          const totalStudents = classrooms.reduce((sum, c) => sum + (c.studentCount || 0), 0);
          setStats(prev => ({
            ...prev,
            assignedClasses: classesArray.length,
            totalStudents,
          }));
        } else {
          setMyClasses([]);
          setStats(prev => ({ ...prev, assignedClasses: 0, totalStudents: 0 }));
        }
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const behaviorsResult = await request(behaviorAPI.getAllBehaviors, {
        startDate: oneWeekAgo.toISOString().split('T')[0],
      });
      if (behaviorsResult.success && behaviorsResult.data?.data) {
        const behaviors = behaviorsResult.data.data.slice(0, 3).map(b => ({
          id: b._id,
          student: `${b.student?.firstName || ''} ${b.student?.lastName || ''}`.trim() || 'Unknown',
          type: b.type,
          note: b.description || b.title,
          date: new Date(b.date).toLocaleString(),
          class: b.student?.class || 'N/A',
        }));
        setRecentBehaviors(behaviors);
        setStats(prev => ({ ...prev, recentBehaviors: behaviorsResult.data.data.length }));
      }
      setNewMessages([]);
    };
    fetchData();
  }, []);

  return (
    <TeacherLayout>
      <Box sx={{ pt: { xs: 2, sm: 3 }, pr: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            👩‍🏫 Teacher Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Daily School Work - Input & Communication
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Show profile form if subject or phone is missing */}
            {teacherProfile && (!teacherProfile.subject || !teacherProfile.phone) && (
              <TeacherProfileForm
                initialSubject={teacherProfile.subject || ''}
                initialPhone={teacherProfile.phone || ''}
                onProfileUpdated={updated => setTeacherProfile(prev => ({ ...prev, ...updated }))}
              />
            )}
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #1976d215 0%, #1976d205 100%)',
                    borderLeft: '4px solid #1976d2',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {stats.assignedClasses}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Assigned Classes
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56 }}>
                      <ClassIcon fontSize="large" />
                    </Avatar>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #2e7d3215 0%, #2e7d3205 100%)',
                    borderLeft: '4px solid #2e7d32',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {stats.totalStudents}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Students
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#2e7d32', width: 56, height: 56 }}>
                      <School fontSize="large" />
                    </Avatar>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #ed6c0215 0%, #ed6c0205 100%)',
                    borderLeft: '4px solid #ed6c02',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {stats.recentBehaviors}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Behaviors (This Week)
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#ed6c02', width: 56, height: 56 }}>
                      <Assignment fontSize="large" />
                    </Avatar>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #9c27b015 0%, #9c27b005 100%)',
                    borderLeft: '4px solid #9c27b0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        <Badge badgeContent={stats.newMessages} color="error">
                          <span>{stats.newMessages}</span>
                        </Badge>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        New Messages
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                      <Message fontSize="large" />
                    </Avatar>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Main Content */}
            <Grid container spacing={3}>
              {/* My Classes */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardHeader
                    title="📚 My Classes"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    action={
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/teacher/classes')}
                      >
                        View All
                      </Button>
                    }
                  />
                  <CardContent>
                    <List>
                      {myClasses.map((classItem) => (
                        <ListItem
                          key={classItem.id}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => navigate(`/teacher/classes/${classItem.id}`)}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {classItem.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                              <Chip label={classItem.termLabel} size="small" color="primary" />
                              <Chip label={`${classItem.students} students`} size="small" variant="outlined" />
                              <Chip label={classItem.subject} size="small" variant="outlined" />
                            </Box>
                          </Box>
                          <IconButton>
                            <ArrowForward />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/teacher/classes')}
                    >
                      Manage Classes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Behaviors */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardHeader
                    title="📝 Recent Behavior Logs"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    action={
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/teacher/behaviors')}
                      >
                        View All
                      </Button>
                    }
                  />
                  <CardContent>
                    <List>
                      {recentBehaviors.map((log) => (
                        <ListItem
                          key={log.id}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  {log.student}
                                </Typography>
                                <Chip
                                  label={log.type}
                                  size="small"
                                  color={log.type === 'positive' ? 'success' : 'error'}
                                />
                                <Chip label={`Class ${log.class}`} size="small" variant="outlined" />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {log.note}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {log.date}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/teacher/behaviors')}
                    >
                      View All Behaviors
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* New Messages */}
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardHeader
                    title="💬 New Parent Messages"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    action={
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Message />}
                        onClick={() => navigate('/teacher/messages')}
                      >
                        View All Messages
                      </Button>
                    }
                  />
                  <CardContent>
                    {newMessages.filter(m => m.unread).length === 0 ? (
                      <Alert severity="info">No new messages</Alert>
                    ) : (
                      <List>
                        {newMessages
                          .filter((msg) => msg.unread)
                          .map((msg) => (
                            <ListItem
                              key={msg.id}
                              sx={{
                                border: '1px solid',
                                borderColor: 'primary.main',
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: 'primary.light',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'primary.light' },
                              }}
                              onClick={() => navigate('/teacher/messages')}
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Badge color="error" variant="dot">
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        {msg.from}
                                      </Typography>
                                    </Badge>
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                      {msg.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {msg.time}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Card elevation={2} sx={{ mt: 3 }}>
              <CardHeader
                title="⚡ Quick Actions"
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<EventAvailable />}
                      onClick={() => navigate('/teacher/attendance')}
                    >
                      Mark Attendance
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<Add />}
                      onClick={() => navigate('/teacher/behaviors')}
                    >
                      Add Behavior
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<BarChart />}
                      onClick={() => navigate('/teacher/assessments')}
                    >
                      Record Assessment
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<Message />}
                      onClick={() => navigate('/teacher/messages')}
                    >
                      Message Parents
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </TeacherLayout>
  );
}

export default TeacherDashboard;