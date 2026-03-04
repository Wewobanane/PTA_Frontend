import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Alert,
  Grid,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  ThumbUp,
  ThumbDown,
  EventAvailable,
  History,
  ArrowBack,
  People,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { teacherAPI, behaviorAPI, attendanceAPI, authAPI } from '../../config/api';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

function ClassDetails() {
  const { classId } = useParams(); // academicYearId (classroom id)
  const navigate = useNavigate();
  const { request, loading, error } = useApi();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    if (!classId) return;
    const fetchClassData = async () => {
      let teacher = null;
      const teacherResult = await request(authAPI.getCurrentUser);
      if (teacherResult.success && teacherResult.data?.data) {
        teacher = teacherResult.data.data;
        setTeacherData(teacher);
      }

      const classroomResult = await request(teacherAPI.getClassroom, classId);
      if (!classroomResult.success || !classroomResult.data?.data) {
        setClassData(null);
        setStudents([]);
        return;
      }
      const room = classroomResult.data.data;
      setClassData({
        id: classId,
        name: `${room.yearName} · ${room.termLabel} · ${room.classLevel}`,
        grade: room.classLevel,
        subject: teacher?.subject || 'Not assigned',
        academicYear: room.yearName,
        term: room.termLabel,
        room: (teacher?.rooms?.length ? teacher.rooms.join(', ') : (teacher?.room || null)),
        studentCount: room.studentCount || 0,
      });

      const studentsResult = await request(teacherAPI.getClassroomStudents, classId);
      if (!studentsResult.success || !studentsResult.data?.data) {
        setStudents([]);
        return;
      }
      const studentsInClass = studentsResult.data.data;
      const today = new Date().toISOString().split('T')[0];
      const studentsWithData = await Promise.all(
        studentsInClass.map(async (student) => {
          const attendanceResult = await request(attendanceAPI.getAllAttendance, {
            studentId: student._id,
            date: today,
          });
          const attendance = attendanceResult.success && attendanceResult.data?.data?.length > 0
            ? attendanceResult.data.data[0].status
            : 'unknown';
          const behaviorsResult = await request(behaviorAPI.getAllBehaviors, { studentId: student._id });
          const behaviors = behaviorsResult.success ? behaviorsResult.data.data : [];
          const positiveCount = behaviors.filter(b => b.type === 'positive').length;
          const negativeCount = behaviors.filter(b => b.type === 'negative').length;
          const recentBehavior = behaviors.length > 0 ? behaviors[0].type : null;
          return {
            id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            studentId: student.studentId,
            attendance,
            recentBehavior,
            behaviorCount: { positive: positiveCount, negative: negativeCount },
          };
        })
      );
      setStudents(studentsWithData);
    };

    fetchClassData();
  }, [classId]);

  const getBehaviorIcon = (behavior) => {
    if (behavior === 'positive') return <ThumbUp sx={{ color: 'success.main', fontSize: 20 }} />;
    if (behavior === 'negative') return <ThumbDown sx={{ color: 'error.main', fontSize: 20 }} />;
    return <span style={{ color: '#ccc' }}>—</span>;
  };

  const getAttendanceChip = (status) => {
    if (status === 'present') {
      return <Chip label="Present" color="success" size="small" />;
    }
    return <Chip label="Absent" color="error" size="small" />;
  };

  return (
    <TeacherLayout>
      <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/teacher/classes')}
                sx={{ mb: 2 }}
              >
                Back to My Classes
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                  <People fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {classData?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`Grade ${classData?.grade}`} size="small" />
                    <Chip label={classData?.academicYear} size="small" color="primary" variant="outlined" />
                    <Chip label={classData?.term} size="small" color="secondary" variant="outlined" />
                    <Chip label={`${classData?.studentCount} Students`} size="small" color="success" />
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                What You Can Do:
              </Typography>
              <Typography variant="body2">
                ✅ Add behavior records for students<br />
                ✅ Mark attendance<br />
                ✅ View student history<br />
                ❌ Cannot add or remove students (admin only)<br />
                <br />
                <strong>Note:</strong> Showing students for {classData?.academicYear} - {classData?.term}
              </Typography>
            </Alert>

            {/* Tabs */}
            <Card elevation={2}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Student List" />
                <Tab label="Class Overview" />
              </Tabs>

              <CardContent>
                {tabValue === 0 && (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      📋 Daily Use Screen
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Student ID</strong></TableCell>
                            <TableCell><strong>Student Name</strong></TableCell>
                            <TableCell align="center"><strong>Attendance</strong></TableCell>
                            <TableCell align="center"><strong>Recent Behavior</strong></TableCell>
                            <TableCell align="center"><strong>Behavior Count</strong></TableCell>
                            <TableCell align="center"><strong>Quick Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {student.studentId}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  {student.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {getAttendanceChip(student.attendance)}
                              </TableCell>
                              <TableCell align="center">
                                {getBehaviorIcon(student.recentBehavior)}
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  <Chip
                                    icon={<ThumbUp />}
                                    label={student.behaviorCount.positive}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                  <Chip
                                    icon={<ThumbDown />}
                                    label={student.behaviorCount.negative}
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                  />
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    title="Add Behavior"
                                    onClick={() => navigate(`/teacher/behaviors?studentId=${student.id}&classId=${classId}`)}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="secondary"
                                    title="Mark Attendance"
                                    onClick={() => navigate(`/teacher/attendance?classId=${classId}`)}
                                  >
                                    <EventAvailable />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="info"
                                    title="View History"
                                    onClick={() => navigate(`/teacher/students/${student.id}/history`)}
                                  >
                                    <History />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<EventAvailable />}
                        onClick={() => navigate(`/teacher/attendance?classId=${classId}`)}
                      >
                        Mark Attendance for All
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/teacher/behaviors?classId=${classId}`)}
                      >
                        Add Behavior Record
                      </Button>
                    </Box>
                  </>
                )}

                {tabValue === 1 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: 'primary.light' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Class Information
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Class:</strong> {classData?.name}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Grade:</strong> {classData?.grade}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Subject:</strong> {classData?.subject}
                        </Typography>
                        {classData?.room && (
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Room:</strong> {classData?.room}
                          </Typography>
                        )}
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Academic Year:</strong> {classData?.academicYear}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Term:</strong> {classData?.term}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: 'success.light' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Class Statistics
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Total Students:</strong> {classData?.studentCount}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Present Today:</strong> {students.filter(s => s.attendance === 'present').length}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Absent Today:</strong> {students.filter(s => s.attendance === 'absent').length}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Attendance Rate:</strong> {students.length ? Math.round((students.filter(s => s.attendance === 'present').length / students.length) * 100) : 0}%
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </TeacherLayout>
  );
}

export default ClassDetails;
