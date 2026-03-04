import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LinearProgress,
  Alert,
  CircularProgress,
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  Warning,
  Message,
  TrendingUp,
  School,
  Assignment,
  BarChart,
  CalendarToday,
  Person,
  ArrowForward,
  Info,
} from '@mui/icons-material';
import ParentLayout from '../../components/layout/ParentLayout';
import { parentAPI, attendanceAPI, behaviorAPI } from '../../config/api';
import { useApi } from '../../hooks/useApi';

function ParentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myChildren, setMyChildren] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    avgAttendance: 0,
    positiveBehaviors: 0,
    alerts: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch parent's children
      const childrenResponse = await parentAPI.getChildren();
      const children = childrenResponse.data?.data || [];
      setMyChildren(children);

      // Calculate stats from real data
      const totalChildren = children.length;

      // Fetch attendance and behaviors for all children
      let totalPresent = 0;
      let totalAttendance = 0;
      let positiveBehaviorsCount = 0;
      let alertsCount = 0;
      const updates = [];

      for (const child of children) {
        // Get attendance
        const attendanceRes = await parentAPI.getChildAttendance(child._id);
        const attendanceRecords = attendanceRes.data?.data || [];
        totalPresent += attendanceRecords.filter(a => a.status === 'present').length;
        totalAttendance += attendanceRecords.length;

        // Get behaviors
        const behaviorRes = await parentAPI.getChildBehavior(child._id);
        const behaviors = behaviorRes.data?.data || [];
        positiveBehaviorsCount += behaviors.filter(b => b.type === 'positive').length;
        alertsCount += behaviors.filter(b => b.type === 'negative').length;

        // Recent behaviors as updates
        behaviors.slice(0, 2).forEach(b => {
          updates.push({
            _id: b._id,
            type: b.type === 'positive' ? 'behavior_positive' : 'behavior_negative',
            message: b.title || b.description,
            createdAt: b.date,
            childName: `${child.firstName} ${child.lastName}`,
            teacherName: b.teacher?.name || 'N/A',
          });
        });
      }

      const avgAttendance = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

      setStats({
        totalChildren,
        avgAttendance,
        positiveBehaviors: positiveBehaviorsCount,
        alerts: alertsCount,
      });

      setRecentUpdates(updates.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: 'My Children',
      value: stats.totalChildren,
      icon: <School />,
      color: '#1976d2',
      progress: 100
    },
    {
      title: 'Avg Attendance',
      value: `${stats.avgAttendance}%`,
      icon: <CheckCircle />,
      color: '#2e7d32',
      progress: stats.avgAttendance
    },
    {
      title: 'Positive Behaviors',
      value: stats.positiveBehaviors,
      icon: <Star />,
      color: '#f57c00',
      progress: Math.min(stats.positiveBehaviors * 5, 100)
    },
    {
      title: 'Alerts',
      value: stats.alerts,
      icon: <Warning />,
      color: '#d32f2f',
      progress: Math.min(stats.alerts * 10, 100)
    },
  ];

  const getUpdateSeverity = (type) => {
    const severityMap = {
      behavior_positive: 'success',
      behavior_negative: 'error',
      assessment: 'info',
      attendance: 'warning',
      message: 'info',
    };
    return severityMap[type] || 'info';
  };

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

  if (loading) {
    return (
      <ParentLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={60} />
        </Box>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}

        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Parent Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          👨‍👩‍👧 Monitor your children's progress and activities
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            🔒 <strong>Privacy Notice:</strong> You see ONLY your children's information. Data is updated in real-time.
          </Typography>
        </Alert>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                borderLeft: `4px solid ${stat.color}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                  {stat.icon}
                </Avatar>
                {stat.title === 'Avg Attendance' && stat.progress >= 90 && (
                  <TrendingUp sx={{ color: 'success.main' }} />
                )}
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {stat.title}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stat.progress}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: `${stat.color}20`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: stat.color,
                  },
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* My Children & Recent Updates */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card elevation={2}>
            <CardHeader
              title="My Children"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              action={
                <Chip
                  label={`${myChildren.length} ${myChildren.length === 1 ? 'Child' : 'Children'}`}
                  color="primary"
                  size="small"
                />
              }
            />
            <CardContent>
              {myChildren.length === 0 ? (
                <Alert severity="info">No children linked to your account yet.</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {myChildren.map((child) => (
                    <Paper
                      key={child._id}
                      elevation={1}
                      sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => navigate(`/parent/child/${child._id}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            mr: 2,
                            width: 56,
                            height: 56,
                            fontSize: '1.5rem',
                          }}
                        >
                          {(child.firstName || child.name || 'C')?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {child.firstName && child.lastName ? `${child.firstName} ${child.lastName}` : child.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Class: {child.class || child.className || 'Not Assigned'}
                          </Typography>
                        </Box>
                        <ArrowForward sx={{ color: 'primary.main' }} />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Attendance
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              color: child.attendanceRate >= 90 ? 'success.main' : 'warning.main'
                            }}
                          >
                            {child.attendanceRate || 0}%
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Behavior
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={`🟢 ${child.positiveBehaviors || 0}`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                            <Chip
                              label={`🔴 ${child.negativeBehaviors || 0}`}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Grade Average
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', color: 'primary.main' }}
                          >
                            {child.gradeAverage || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card elevation={2}>
            <CardHeader
              title="Recent Updates"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              action={
                <Badge badgeContent={recentUpdates.length} color="primary">
                  <Info />
                </Badge>
              }
            />
            <CardContent>
              {recentUpdates.length === 0 ? (
                <Alert severity="info">No recent updates.</Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentUpdates.map((update, index) => (
                    <React.Fragment key={update._id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{ px: 0 }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Chip
                                label={update.type}
                                size="small"
                                color={getUpdateSeverity(update.type)}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(update.createdAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {update.childName}
                              </Typography>
                              <Typography variant="body2" color="text.primary">
                                {update.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                By: {update.teacherName}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < recentUpdates.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card elevation={2}>
        <CardHeader
          title="Quick Actions"
          titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => navigate('/parent/behaviors')}
                sx={{
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                  transition: 'all 0.3s',
                }}
              >
                <Assignment />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Behavior History
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                color="success"
                fullWidth
                onClick={() => navigate('/parent/attendance')}
                sx={{
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                  transition: 'all 0.3s',
                }}
              >
                <CalendarToday />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Attendance Records
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => navigate('/parent/messages')}
                sx={{
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                  transition: 'all 0.3s',
                }}
              >
                <Message />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Message Teachers
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                color="warning"
                fullWidth
                onClick={() => navigate('/parent/performance')}
                sx={{
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                  transition: 'all 0.3s',
                }}
              >
                <BarChart />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Academic Performance
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </ParentLayout>
  );
}

export default ParentDashboard;
