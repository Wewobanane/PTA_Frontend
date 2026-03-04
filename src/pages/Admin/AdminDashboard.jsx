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
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  School,
  Class as ClassIcon,
  PersonAdd,
  Assessment,
  Link as LinkIcon,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from 'axios';

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    parents: 0,
    linkedRelationships: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
      const token = localStorage.getItem('token');
      
      const [studentsRes, teachersRes, parentsRes] = await Promise.all([
        axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/users?role=teacher`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/users?role=parent`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } })),
      ]);

      const students = studentsRes.data.data || [];
      const linkedCount = students.filter(s => s.parents?.length > 0).length;

      setStats({
        students: students.length,
        teachers: teachersRes.data.data?.length || 0,
        parents: parentsRes.data.data?.length || 0,
        linkedRelationships: linkedCount,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupSteps = [
    {
      id: 1,
      title: '👩‍🏫 Step 1: Create Teachers',
      description: 'Add teachers, assign classes/rooms (teachers set subjects & phone)',
      completed: stats.teachers > 0,
      action: () => navigate('/admin/teachers'),
      buttonText: 'Go to Teachers',
    },
    {
      id: 2,
      title: '👨‍👩‍👧 Step 2: Create Parents',
      description: 'Add parents and link them to their children (use "Link to Children" button)',
      completed: stats.parents > 0,
      action: () => navigate('/admin/parents'),
      buttonText: 'Go to Parents',
    },
    {
      id: 3,
      title: '📚 Step 3: Setup Academic Years',
      description: 'Create academic years, add terms, and add students - all in one place',
      completed: stats.students > 0,
      action: () => navigate('/admin/academic-years'),
      buttonText: 'Go to Academic Years',
    },
  ];

  const completedSteps = setupSteps.filter(s => s.completed).length;
  const setupProgress = (completedSteps / setupSteps.length) * 100;

  return (
    <AdminLayout>
      <Box sx={{ pt: { xs: 2, sm: 3, md: 3 }, pr: { xs: 2, sm: 3, md: 3 }, pb: { xs: 2, sm: 3, md: 3 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            🧑‍💼 Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            System Setup & Management Center
          </Typography>
        </Box>

        {/* Setup Progress Alert */}
        {setupProgress < 100 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Welcome! Let's set up your PTA system
            </Typography>
            <Typography variant="body2">
              Complete the setup steps below to get started. {completedSteps} of {setupSteps.length} steps completed.
            </Typography>
          </Alert>
        )}

        {setupProgress === 100 && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              ✔️ System Setup Complete!
            </Typography>
            <Typography variant="body2">
              All data relationships are in place. The system is ready for daily operations.
            </Typography>
          </Alert>
        )}

        {/* Stats Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48, mb: 2 }}>
                  <School />
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.students}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Students
                </Typography>
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
                <Avatar sx={{ bgcolor: '#2e7d32', width: 48, height: 48, mb: 2 }}>
                  <People />
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.teachers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Teachers
                </Typography>
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
                <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48, mb: 2 }}>
                  <People />
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.parents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Parents
                </Typography>
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
                <Avatar sx={{ bgcolor: '#ed6c02', width: 48, height: 48, mb: 2 }}>
                  <LinkIcon />
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.linkedRelationships}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Linked Students
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Setup Steps */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardHeader
            title="📋 System Setup Steps (Follow This Order)"
            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            subheader="Complete these steps in order for proper system configuration"
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {completedSteps}/{setupSteps.length} Complete
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={setupProgress}
                  size={40}
                  thickness={5}
                />
              </Box>
            }
          />
          <CardContent>
            <List>
              {setupSteps.map((step, index) => (
                <ListItem
                  key={step.id}
                  sx={{
                    borderBottom: index < setupSteps.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    py: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: step.completed ? 'success.main' : 'action.selected',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {step.completed ? <CheckCircle /> : step.id}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                    </Box>
                    <Button
                      variant={step.completed ? 'outlined' : 'contained'}
                      endIcon={<ArrowForward />}
                      onClick={step.action}
                    >
                      {step.buttonText}
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Admin Responsibilities */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader
                title="✅ Admin Can Do"
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              />
              <CardContent>
                <List>
                  {[
                    'Create and manage user accounts',
                    'Define subjects for assessments',
                    'Set up academic terms',
                    'Set up classes and academic years',
                    'Link parents to their children',
                    'Assign teachers to classes',
                    'View system-wide reports',
                    'Manage system settings',
                  ].map((item, idx) => (
                    <ListItem key={idx} sx={{ py: 1 }}>
                      <CheckCircle sx={{ color: 'success.main', mr: 2 }} />
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader
                title="❌ Admin Does NOT"
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              />
              <CardContent>
                <List>
                  {[
                    'Record student grades',
                    'Add behavior incidents',
                    'Message parents directly',
                    'Take attendance',
                    'Manage homework assignments',
                    'Upload student work',
                  ].map((item, idx) => (
                    <ListItem key={idx} sx={{ py: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: 'error.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        <Typography sx={{ color: 'error.main', fontWeight: 'bold', fontSize: 16 }}>
                          ×
                        </Typography>
                      </Box>
                      <ListItemText primary={item} primaryTypographyProps={{ color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>     
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboard;
