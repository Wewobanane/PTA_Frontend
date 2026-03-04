import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack,
  School,
  CheckCircle,
  Cancel,
  Star,
  Warning,
  Assignment,
  BarChart,
  CalendarToday,
  Person,
  Email,
  Phone,
  Class as ClassIcon,
} from '@mui/icons-material';
import ParentLayout from '../../components/layout/ParentLayout';
import { parentAPI, studentAPI } from '../../config/api';

function ChildDetails() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [behaviorRecords, setBehaviorRecords] = useState([]);
  const [assessmentRecords, setAssessmentRecords] = useState([]);

  useEffect(() => {
    fetchChildDetails();
  }, [childId]);

  const fetchChildDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch child basic info
      const childResponse = await studentAPI.getStudent(childId);
      setChild(childResponse.data?.data);

      // Fetch attendance records
      const attendanceResponse = await parentAPI.getChildAttendance(childId);
      setAttendanceRecords(attendanceResponse.data?.data || []);

      // Fetch behavior records
      const behaviorResponse = await parentAPI.getChildBehavior(childId);
      setBehaviorRecords(behaviorResponse.data?.data || []);

      // Fetch assessment records
      const assessmentResponse = await parentAPI.getChildGrades(childId);
      setAssessmentRecords(assessmentResponse.data?.data || []);

    } catch (error) {
      console.error('Error fetching child details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  if (!child) {
    return (
      <ParentLayout>
        <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
          <Alert severity="error">Child not found or you don't have permission to view this child.</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/parent/dashboard')} sx={{ mt: 2 }}>
            Back to Dashboard
          </Button>
        </Box>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
        {/* Header with Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/parent/dashboard')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Child Details
          </Typography>
        </Box>

        {/* Child Info Card */}
        <Card elevation={3} sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  mr: 3,
                }}
              >
                {child.name?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {child.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<School />} label={child.className || 'Not Assigned'} color="primary" />
                  <Chip icon={<Person />} label={`Student ID: ${child.studentId || 'N/A'}`} />
                  {child.email && <Chip icon={<Email />} label={child.email} />}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Stats Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Attendance Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main', my: 1 }}>
                    {child.attendanceRate || 0}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={child.attendanceRate || 0}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Positive Behaviors
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main', my: 1 }}>
                    🟢 {child.positiveBehaviors || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This term
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Negative Behaviors
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'error.main', my: 1 }}>
                    🔴 {child.negativeBehaviors || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This term
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Grade Average
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', my: 1 }}>
                    {child.gradeAverage || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Overall
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs for Different Records */}
        <Card elevation={2}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="child records tabs">
              <Tab label="Attendance" icon={<CalendarToday />} iconPosition="start" />
              <Tab label="Behavior" icon={<Star />} iconPosition="start" />
              <Tab label="Assessments" icon={<Assignment />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Attendance Tab */}
          {tabValue === 0 && (
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Attendance History
              </Typography>
              {attendanceRecords.length === 0 ? (
                <Alert severity="info">No attendance records found.</Alert>
              ) : (
                <List>
                  {attendanceRecords.map((record) => (
                    <React.Fragment key={record._id}>
                      <ListItem>
                        <ListItemIcon>
                          {record.status === 'present' ? (
                            <CheckCircle sx={{ color: 'success.main' }} />
                          ) : (
                            <Cancel sx={{ color: 'error.main' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formatDate(record.date)}
                              </Typography>
                              <Chip
                                label={record.status}
                                color={record.status === 'present' ? 'success' : 'error'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary">
                                Teacher: {record.teacherName}
                              </Typography>
                              {record.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  Note: {record.notes}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          )}

          {/* Behavior Tab */}
          {tabValue === 1 && (
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Behavior History
              </Typography>
              {behaviorRecords.length === 0 ? (
                <Alert severity="info">No behavior records found.</Alert>
              ) : (
                <List>
                  {behaviorRecords.map((record) => (
                    <React.Fragment key={record._id}>
                      <ListItem
                        sx={{
                          bgcolor: record.type === 'positive' ? 'success.50' : 'error.50',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemIcon>
                          {record.type === 'positive' ? (
                            <Star sx={{ color: 'success.main', fontSize: 32 }} />
                          ) : (
                            <Warning sx={{ color: 'error.main', fontSize: 32 }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {record.type === 'positive' ? '🟢' : '🔴'} {record.category}
                              </Typography>
                              <Chip
                                label={record.type}
                                color={record.type === 'positive' ? 'success' : 'error'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                {record.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(record.date)} • Teacher: {record.teacherName}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          )}

          {/* Assessments Tab */}
          {tabValue === 2 && (
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Assessment Records
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  📊 <strong>Grading System:</strong> Classwork (20%), Test (30%), Exam (50%)
                </Typography>
              </Alert>
              {assessmentRecords.length === 0 ? (
                <Alert severity="info">No assessment records found.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {assessmentRecords.map((record) => (
                    <Grid item xs={12} sm={6} md={4} key={record._id}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          borderLeft: `4px solid ${
                            record.type === 'Exam'
                              ? '#d32f2f'
                              : record.type === 'Test'
                              ? '#f57c00'
                              : '#1976d2'
                          }`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {record.subject}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {record.title}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip label={record.type} size="small" />
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {record.score}/{record.totalScore}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(record.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Teacher: {record.teacherName}
                        </Typography>
                        {record.feedback && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            <Typography variant="caption">{record.feedback}</Typography>
                          </Alert>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          )}
        </Card>
      </Box>
    </ParentLayout>
  );
}

export default ChildDetails;
