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
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  School,
  ArrowBack,
} from '@mui/icons-material';
import ParentLayout from '../../components/layout/ParentLayout';
import { parentAPI, gradeAPI } from '../../config/api';

function AcademicPerformance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myChildren, setMyChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchAssessments(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildren();
      const children = response.data?.data || [];
      setMyChildren(children);
      if (children.length > 0) {
        setSelectedChild(children[0]._id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async (childId) => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildGrades(childId);
      const grades = response.data?.data || [];
      setAssessments(grades);
      
      // Calculate summary
      const grouped = {};
      grades.forEach(grade => {
        const subject = grade.subject;
        if (!grouped[subject]) {
          grouped[subject] = {
            classwork: [],
            test: [],
            exam: [],
            teachers: new Map(),
            term: grade.term,
            academicYear: grade.academicYear,
          };
        }
        const type = grade.assessmentType;
        if (grouped[subject][type]) {
          grouped[subject][type].push(grade);
        }
        if (grade.teacher && grade.teacher.name) {
          const key = grade.teacher._id || grade.teacher.id || grade.teacher.name;
          const currentCount = grouped[subject].teachers.get(key)?.count || 0;
          grouped[subject].teachers.set(key, {
            name: grade.teacher.name,
            count: currentCount + 1,
          });
        }
      });

      const summaryData = Object.entries(grouped).map(([subject, types]) => {
        const classworkAvg = types.classwork.length > 0
          ? types.classwork.reduce((sum, a) => sum + a.percentage, 0) / types.classwork.length
          : 0;
        const testAvg = types.test.length > 0
          ? types.test.reduce((sum, a) => sum + a.percentage, 0) / types.test.length
          : 0;
        const examAvg = types.exam.length > 0
          ? types.exam.reduce((sum, a) => sum + a.percentage, 0) / types.exam.length
          : 0;

        const finalGrade = (classworkAvg * 0.2) + (testAvg * 0.3) + (examAvg * 0.5);

        // Map final grade to letter grade using same scale as teacher portal
        let letterGrade = 'F';
        if (finalGrade >= 90) letterGrade = 'A+';
        else if (finalGrade >= 85) letterGrade = 'A';
        else if (finalGrade >= 80) letterGrade = 'B+';
        else if (finalGrade >= 75) letterGrade = 'B';
        else if (finalGrade >= 70) letterGrade = 'C+';
        else if (finalGrade >= 65) letterGrade = 'C';
        else if (finalGrade >= 60) letterGrade = 'D';
        else if (finalGrade >= 50) letterGrade = 'E';

        // Pick the most frequent teacher for this subject
        let teacherName = 'N/A';
        if (types.teachers && types.teachers.size > 0) {
          const sortedTeachers = Array.from(types.teachers.values()).sort((a, b) => b.count - a.count);
          teacherName = sortedTeachers[0].name;
        }

        return {
          subject,
          classworkAvg: classworkAvg.toFixed(1),
          testAvg: testAvg.toFixed(1),
          examAvg: examAvg.toFixed(1),
          finalGrade: finalGrade.toFixed(1),
          letterGrade,
          classworkCount: types.classwork.length,
          testCount: types.test.length,
          examCount: types.exam.length,
          teacherName,
          term: types.term,
          academicYear: types.academicYear,
          position: '—',
        };
      });

      // Fetch positions for each subject from backend
      const rankResponses = await Promise.all(
        summaryData.map(async (row) => {
          if (!row.term || !row.academicYear) {
            return { subject: row.subject, position: '—' };
          }
          try {
            const res = await gradeAPI.getStudentSubjectRank(childId, {
              subject: row.subject,
              term: row.term,
              academicYear: row.academicYear,
            });
            const position = res.data?.data?.position ?? null;
            return {
              subject: row.subject,
              position: position ? `${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'}` : '—',
            };
          } catch (e) {
            console.error('Error fetching rank for subject', row.subject, e);
            return { subject: row.subject, position: '—' };
          }
        })
      );

      const summaryWithPositions = summaryData.map((row) => {
        const rank = rankResponses.find((r) => r.subject === row.subject);
        return {
          ...row,
          position: rank?.position || '—',
        };
      });

      setSummary(summaryWithPositions);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 80) return 'success';
    if (grade >= 70) return 'info';
    if (grade >= 60) return 'warning';
    return 'error';
  };

  const selectedChildData = myChildren.find(c => c._id === selectedChild);

  if (loading && myChildren.length === 0) {
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
      <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ArrowBack
            sx={{ mr: 2, cursor: 'pointer' }}
            onClick={() => navigate('/parent/dashboard')}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Academic Performance
            </Typography>
            <Typography variant="body1" color="text.secondary">
              📊 View grades and assessment scores
            </Typography>
          </Box>
        </Box>

        {/* Child Selector */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel>Select Child</InputLabel>
              <Select
                value={selectedChild}
                label="Select Child"
                onChange={(e) => setSelectedChild(e.target.value)}
              >
                {myChildren.map((child) => (
                  <MenuItem key={child._id} value={child._id}>
                    {child.firstName} {child.lastName} - {child.class || 'Not Assigned'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Grading System Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>📐 Grading System:</strong> Classwork (20%), Test (30%), Exam (50%) = Final Grade
          </Typography>
        </Alert>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : assessments.length === 0 ? (
          <Alert severity="info">No assessment records available yet.</Alert>
        ) : (
          <>
            {/* Summary by Subject */}
            {summary && summary.length > 0 && (
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardHeader
                  title="Performance Summary"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  avatar={<Assessment />}
                />
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Subject</strong></TableCell>
                          <TableCell><strong>Teacher</strong></TableCell>
                          <TableCell align="center"><strong>Classwork (20%)</strong></TableCell>
                          <TableCell align="center"><strong>Test (30%)</strong></TableCell>
                          <TableCell align="center"><strong>Exam (50%)</strong></TableCell>
                          <TableCell align="center"><strong>Final Score (%)</strong></TableCell>
                          <TableCell align="center"><strong>Grade</strong></TableCell>
                          <TableCell align="center"><strong>Position</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.map((row) => (
                          <TableRow key={row.subject}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <School fontSize="small" color="primary" />
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {row.subject}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {row.teacherName}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.classworkAvg}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({row.classworkCount} scores)
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.testAvg}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({row.testCount} scores)
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.examAvg}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({row.examCount} scores)
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${row.finalGrade}%`}
                                color={getGradeColor(parseFloat(row.finalGrade))}
                                icon={
                                  parseFloat(row.finalGrade) >= 70 ? (
                                    <TrendingUp />
                                  ) : (
                                    <TrendingDown />
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={row.letterGrade}
                                color={
                                  row.letterGrade.startsWith('A') ? 'success' :
                                  row.letterGrade.startsWith('B') || row.letterGrade.startsWith('C') ? 'info' :
                                  row.letterGrade === 'E' ? 'warning' :
                                  'error'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {row.position}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* All Assessments */}
            <Card elevation={2}>
              <CardHeader
                title="All Assessment Records"
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  {assessments.map((assessment) => (
                    <Grid item xs={12} sm={6} md={4} key={assessment._id}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          borderLeft: `4px solid ${
                            assessment.assessmentType === 'exam'
                              ? '#d32f2f'
                              : assessment.assessmentType === 'test'
                              ? '#f57c00'
                              : '#1976d2'
                          }`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {assessment.subject}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {assessment.title}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Chip label={assessment.assessmentType} size="small" />
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {assessment.score}/{assessment.maxScore}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={assessment.maxScore ? (assessment.score / assessment.maxScore) * 100 : 0}
                          sx={{ height: 8, borderRadius: 1, mb: 1 }}
                        />
                        <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600 }}>
                          {assessment.maxScore ? ((assessment.score / assessment.maxScore) * 100).toFixed(1) : '0.0'}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {new Date(assessment.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Teacher: {assessment.teacher?.name || 'N/A'}
                        </Typography>
                        {assessment.comments && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            <Typography variant="caption">{assessment.comments}</Typography>
                          </Alert>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </ParentLayout>
  );
}

export default AcademicPerformance;
