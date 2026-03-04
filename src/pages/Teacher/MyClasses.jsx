import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Class as ClassIcon,
  People,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { authAPI, teacherAPI } from '../../config/api';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

function MyClasses() {
  const navigate = useNavigate();
  const { request, loading, error } = useApi();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      const teacherResult = await request(authAPI.getCurrentUser);
      let teacher = null;
      if (teacherResult.success && teacherResult.data?.data) {
        teacher = teacherResult.data.data;
        setTeacherData(teacher);
      }

      const classroomsResult = await request(teacherAPI.getClassrooms);
      if (classroomsResult.success && classroomsResult.data?.data) {
        const classrooms = classroomsResult.data.data;
        const classesArray = classrooms.map(c => ({
          id: c.academicYearId,
          name: `${c.yearName} · ${c.termLabel} · ${c.classLevel}`,
          yearName: c.yearName,
          termLabel: c.termLabel,
          grade: c.classLevel,
          studentCount: c.studentCount || 0,
          subject: teacher?.subject || 'Not assigned',
          room: (teacher?.rooms?.length ? teacher.rooms.join(', ') : (teacher?.room || null)),
        }));
        setClasses(classesArray);
      } else {
        setClasses([]);
      }
    };

    fetchClasses();
  }, []);

  return (
    <TeacherLayout>
      <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            📚 My Classes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Classes assigned to you
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
        ) : classes.length === 0 ? (
          <Alert severity="info">
            No classes assigned to you yet. Contact admin if this is incorrect.
          </Alert>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                What You Can Do:
              </Typography>
              <Typography variant="body2">
                ✓ View student list<br />
                ✓ Mark attendance<br />
                ✓ Add behavior logs<br />
                ✓ Record assessments (Classwork, Test, Exam)<br />
                ✗ Cannot add/remove students<br />
                ✗ Cannot change parent links
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              {classes.map((classItem) => (
                <Grid item xs={12} md={6} lg={4} key={classItem.id}>
                  <Card
                    elevation={3}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => navigate(`/teacher/classes/${classItem.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56,
                            mr: 2,
                          }}
                        >
                          <ClassIcon fontSize="large" />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {classItem.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Grade {classItem.grade}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <People sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          <strong>{classItem.studentCount}</strong> Students
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {classItem.room && (
                          <Chip
                            label={classItem.room}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={classItem.subject}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForward />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/teacher/classes/${classItem.id}`);
                        }}
                      >
                        View Class Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </TeacherLayout>
  );
}

export default MyClasses;
