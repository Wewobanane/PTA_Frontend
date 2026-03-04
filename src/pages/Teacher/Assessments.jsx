import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  BarChart,
} from '@mui/icons-material';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { teacherAPI, gradeAPI, authAPI } from '../../config/api';
import { useApi } from '../../hooks/useApi';

function Assessments() {
  const { request, loading, error } = useApi();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [classes, setClasses] = useState([]);
  const [classroomStudents, setClassroomStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [selectedClassForView, setSelectedClassForView] = useState('');
  const [viewClassroomStudentIds, setViewClassroomStudentIds] = useState([]);
  const [selectedSubjectForView, setSelectedSubjectForView] = useState('');
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [finalGrades, setFinalGrades] = useState([]);
  const [formData, setFormData] = useState({
    classId: '',
    subject: '',
    assessmentType: 'classwork',
    term: '1st',
    title: '',
    maxScore: 100,
    scores: {},
  });

  const assessmentTypes = [
    { value: 'classwork', label: 'Classwork (20%)', color: '#2196f3' },
    { value: 'test', label: 'Test (30%)', color: '#ff9800' },
    { value: 'exam', label: 'Exam (50%)', color: '#f44336' },
  ];

  // Fetch teacher (subjects), classrooms, and grades on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherResult = await request(authAPI.getCurrentUser);
        if (teacherResult.success && teacherResult.data?.data) {
          const teacher = teacherResult.data.data;
          if (teacher.subject) {
            const subjectList = teacher.subject.split(',').map(s => s.trim()).filter(s => s);
            setTeacherSubjects(subjectList);
          }
        }

        const classroomsResult = await request(teacherAPI.getClassrooms);
        if (classroomsResult.success && classroomsResult.data?.data) {
          setClasses(classroomsResult.data.data.map(c => ({
            id: c.academicYearId,
            name: `${c.yearName} · ${c.termLabel} · ${c.classLevel}`,
            yearName: c.yearName,
          })));
        } else {
          setClasses([]);
        }

        const gradesResult = await request(gradeAPI.getAllGrades);
        if (gradesResult.success && gradesResult.data?.data) {
          setAssessments(gradesResult.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // When user selects a classroom in the dialog, load its students
  useEffect(() => {
    if (!formData.classId) {
      setClassroomStudents([]);
      return;
    }
    const fetchStudents = async () => {
      const res = await request(teacherAPI.getClassroomStudents, formData.classId);
      if (res.success && res.data?.data) {
        setClassroomStudents(res.data.data.map(s => ({
          id: s._id,
          name: `${s.firstName} ${s.lastName}`,
          studentId: s.studentId,
        })));
      } else {
        setClassroomStudents([]);
      }
    };
    fetchStudents();
  }, [formData.classId]);

  // When user selects a classroom for viewing, load its student IDs for filtering
  useEffect(() => {
    if (!selectedClassForView) {
      setViewClassroomStudentIds([]);
      return;
    }
    const fetchStudents = async () => {
      const res = await request(teacherAPI.getClassroomStudents, selectedClassForView);
      if (res.success && res.data?.data) {
        setViewClassroomStudentIds(res.data.data.map(s => s._id.toString()));
      } else {
        setViewClassroomStudentIds([]);
      }
    };
    fetchStudents();
  }, [selectedClassForView]);

  const students = classroomStudents;

  const handleOpenDialog = () => {
    setEditingAssessment(null);
    setFormData({
      classId: '',
      subject: '',
      assessmentType: 'classwork',
      term: '1st',
      title: '',
      maxScore: 100,
      scores: {},
    });
    setOpenDialog(true);
  };

  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment);
    setFormData({
      classId: assessment.student?.academicYearId || '',
      subject: assessment.subject,
      assessmentType: assessment.assessmentType,
      term: assessment.term,
      title: assessment.title,
      maxScore: assessment.maxScore,
      scores: {
        [(assessment.student?._id || assessment.student)]: assessment.score
      },
      studentId: assessment.student?._id || assessment.student,
    });
    setOpenDialog(true);
  };

  const studentIdInView = (a) => {
    const id = a.student?._id || a.student;
    return id && viewClassroomStudentIds.includes(String(id));
  };

  const calculateFinalGrades = (subject) => {
    if (!selectedClassForView || !subject || viewClassroomStudentIds.length === 0) return [];

    const classAssessments = assessments.filter(a =>
      studentIdInView(a) && a.subject === subject
    );

    if (classAssessments.length === 0) return [];

    // Group by student
    const studentGrades = {};
    classAssessments.forEach(assessment => {
      const studentId = assessment.student?._id || assessment.student;
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          studentId,
          student: assessment.student,
          classworks: [],
          tests: [],
          exams: [],
        };
      }
      
      const percentage = (assessment.score / assessment.maxScore) * 100;
      if (assessment.assessmentType === 'classwork') {
        studentGrades[studentId].classworks.push(percentage);
      } else if (assessment.assessmentType === 'test') {
        studentGrades[studentId].tests.push(percentage);
      } else if (assessment.assessmentType === 'exam') {
        studentGrades[studentId].exams.push(percentage);
      }
    });

    // Calculate final grades
    const finalResults = Object.values(studentGrades).map(student => {
      const classworkAvg = student.classworks.length > 0
        ? student.classworks.reduce((a, b) => a + b, 0) / student.classworks.length
        : 0;
      const testAvg = student.tests.length > 0
        ? student.tests.reduce((a, b) => a + b, 0) / student.tests.length
        : 0;
      const examAvg = student.exams.length > 0
        ? student.exams.reduce((a, b) => a + b, 0) / student.exams.length
        : 0;

      const finalScore = (classworkAvg * 0.2) + (testAvg * 0.3) + (examAvg * 0.5);

      return {
        ...student,
        classworkAvg: classworkAvg.toFixed(2),
        testAvg: testAvg.toFixed(2),
        examAvg: examAvg.toFixed(2),
        finalScore: finalScore.toFixed(2),
        classworkCount: student.classworks.length,
        testCount: student.tests.length,
        examCount: student.exams.length,
      };
    });

    // Sort by final score and assign positions
    finalResults.sort((a, b) => parseFloat(b.finalScore) - parseFloat(a.finalScore));
    finalResults.forEach((result, index) => {
      result.position = index + 1;
    });

    return finalResults;
  };

  // Update final grades when assessments, class, or subject changes
  useEffect(() => {
    if (selectedClassForView && selectedSubjectForView) {
      const grades = calculateFinalGrades(selectedSubjectForView);
      setFinalGrades(grades);
    } else {
      setFinalGrades([]);
    }
  }, [assessments, selectedClassForView, selectedSubjectForView, viewClassroomStudentIds]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      classId: '',
      subject: '',
      assessmentType: 'classwork',
      term: '1st',
      title: '',
      maxScore: 100,
      scores: {},
    });
  };

  const handleScoreChange = (studentId, value) => {
    setFormData({
      ...formData,
      scores: {
        ...formData.scores,
        [studentId]: value,
      },
    });
  };

  const handleSubmit = async () => {
    const selectedClass =
      classes.find(c => c.id === formData.classId) ||
      classes.find(c => c.id === selectedClassForView);
    const academicYear = selectedClass?.yearName || '';

    if (editingAssessment) {
      // Update existing assessment
      const gradeData = {
        student: formData.studentId,
        subject: formData.subject,
        assessmentType: formData.assessmentType,
        title: formData.title,
        score: parseFloat(formData.scores[formData.studentId]),
        maxScore: parseFloat(formData.maxScore),
        term: formData.term,
        academicYear,
      };
      
      const result = await request(gradeAPI.updateGrade, editingAssessment._id, gradeData);
      if (result.success) {
        const gradesResult = await request(gradeAPI.getAllGrades);
        if (gradesResult.success && gradesResult.data?.data) {
          setAssessments(gradesResult.data.data);
        }
        handleCloseDialog();
      }
    } else {
      // Create new assessments for all students
      const gradePromises = Object.entries(formData.scores)
        .filter(([_, score]) => score && score !== '')
        .map(async ([studentId, score]) => {
          const gradeData = {
            student: studentId,
            subject: formData.subject,
            assessmentType: formData.assessmentType,
            title: formData.title,
            score: parseFloat(score),
            maxScore: parseFloat(formData.maxScore),
            term: formData.term,
            academicYear,
          };
          
          console.log('Creating grade with data:', gradeData);
          
          try {
            const result = await request(() => gradeAPI.createGrade(gradeData));
            if (!result.success) {
              console.error('Failed to create grade:', result.error || result);
            }
            return result;
          } catch (error) {
            console.error('Error creating grade:', error);
            return { success: false, error };
          }
        });

      const results = await Promise.all(gradePromises);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      console.log(`Created ${successCount} grades, ${failCount} failed`);
      
      if (successCount > 0) {
        // Refresh assessments list
        const gradesResult = await request(gradeAPI.getAllGrades);
        if (gradesResult.success && gradesResult.data?.data) {
          setAssessments(gradesResult.data.data);
        }
        handleCloseDialog();
        
        if (failCount > 0) {
          alert(`${successCount} grades saved successfully, but ${failCount} failed. Check console for details.`);
        }
      } else {
        alert('Failed to save grades. Please check console for error details.');
      }
    }
  };

  return (
    <TeacherLayout>
      <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              📊 Academic Assessments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Record Classwork, Tests, and Exams
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            size="large"
            disabled={classes.length === 0}
          >
            Create Assessment
          </Button>
        </Box>

        {classes.length === 0 && (
          <Alert severity="warning">
            You have no classrooms assigned for the current academic year. Please contact the administrator.
          </Alert>
        )}

        {classes.length > 0 && (
          <>
                {/* Assessment Types Info */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {assessmentTypes.map((type) => (
                <Grid item xs={12} md={4} key={type.value}>
                  <Card sx={{ borderLeft: `4px solid ${type.color}` }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {type.label.split('(')[0]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Weight: <strong>{type.label.match(/\((.+)\)/)[1]}</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                How It Works
              </Typography>
              <Typography variant="body2">
                1. Create multiple assessments per type (Classwork 1, 2, 3... Test 1, 2... Exam)<br />
                2. Enter scores for all students in each assessment<br />
                3. System calculates: Classwork Avg (20%) + Test Avg (30%) + Exam (50%)<br />
                4. View rankings based on final scores<br />
                5. Edit any assessment to update scores
              </Typography>
            </Alert>
            {/* Class and Subject Selection for Viewing */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  View Assessments
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Class</InputLabel>
                      <Select
                        value={selectedClassForView}
                        onChange={(e) => setSelectedClassForView(e.target.value)}
                        label="Select Class"
                      >
                        <MenuItem value="">All Classes</MenuItem>
                        {classes.map((cls) => (
                          <MenuItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Subject</InputLabel>
                      <Select
                        value={selectedSubjectForView}
                        onChange={(e) => setSelectedSubjectForView(e.target.value)}
                        label="Select Subject"
                      >
                        <MenuItem value="">All Subjects</MenuItem>
                        {teacherSubjects.map((subject) => (
                          <MenuItem key={subject} value={subject}>
                            {subject}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={2}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="All Assessments" />
            <Tab label="By Subject" />
            <Tab label="By Type" />
            <Tab label="Final Grades & Rankings" />
          </Tabs>
          <CardContent>
            {tabValue === 0 && (
              <>
                {['classwork', 'test', 'exam'].map((type, typeIndex) => {
                  const typeAssessments = assessments.filter(a => {
                    const matchClass = !selectedClassForView || studentIdInView(a);
                    const matchSubject = !selectedSubjectForView || a.subject === selectedSubjectForView;
                    return a.assessmentType === type && matchClass && matchSubject;
                  });

                  if (typeAssessments.length === 0) return null;

                  const typeColor = type === 'classwork' ? '#2196f3' : type === 'test' ? '#ff9800' : '#f44336';
                  const typeLabel = type === 'classwork' ? '📝 Classwork' : type === 'test' ? '📄 Tests' : '📋 Exams';
                  const typeWeight = type === 'classwork' ? '20%' : type === 'test' ? '30%' : '50%';

                  return (
                    <Box key={type} sx={{ mb: 4 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          mb: 2, 
                          pb: 1, 
                          borderBottom: `3px solid ${typeColor}` 
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: typeColor }}>
                          {typeLabel}
                        </Typography>
                        <Chip 
                          label={`Weight: ${typeWeight}`} 
                          size="small" 
                          sx={{ 
                            bgcolor: typeColor, 
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                        <Chip 
                          label={`${typeAssessments.length} records`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      
                      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: `${typeColor}15` }}>
                              <TableCell><strong>Student</strong></TableCell>
                              <TableCell><strong>Class</strong></TableCell>
                              <TableCell><strong>Subject</strong></TableCell>
                              <TableCell><strong>Title</strong></TableCell>
                              <TableCell><strong>Score</strong></TableCell>
                              <TableCell><strong>Date</strong></TableCell>
                              <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {typeAssessments.map((assessment) => (
                              <TableRow key={assessment._id} hover>
                                <TableCell>
                                  {assessment.student?.firstName} {assessment.student?.lastName}
                                </TableCell>
                                <TableCell>
                                  {assessment.student?.class || 'N/A'}
                                </TableCell>
                                <TableCell>{assessment.subject}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {assessment.title}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <strong>{assessment.score}/{assessment.maxScore}</strong>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    ({((assessment.score / assessment.maxScore) * 100).toFixed(1)}%)
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {new Date(assessment.createdAt || assessment.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleEditAssessment(assessment)}
                                  >
                                    Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  );
                })}
                
                {assessments.filter(a => {
                  const matchClass = !selectedClassForView || studentIdInView(a);
                  const matchSubject = !selectedSubjectForView || a.subject === selectedSubjectForView;
                  return matchClass && matchSubject;
                }).length === 0 && (
                  <Alert severity="info">
                    No assessments recorded yet. Click "Create Assessment" to get started.
                  </Alert>
                )}
              </>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Assessments Grouped by Subject</Typography>
                {teacherSubjects.map(subject => {
                  const subjectAssessments = assessments.filter(a => {
                    const matchClass = !selectedClassForView || studentIdInView(a);
                    return a.subject === subject && matchClass;
                  });
                  
                  if (subjectAssessments.length === 0) return null;
                  
                  return (
                    <Box key={subject} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {subject} ({subjectAssessments.length} assessments)
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Student</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Title</TableCell>
                              <TableCell>Score</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {subjectAssessments.slice(0, 5).map(a => (
                              <TableRow key={a._id}>
                                <TableCell>{a.student?.firstName} {a.student?.lastName}</TableCell>
                                <TableCell>
                                  <Chip label={a.assessmentType} size="small" />
                                </TableCell>
                                <TableCell>{a.title}</TableCell>
                                <TableCell>{a.score}/{a.maxScore}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  );
                })}
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Assessments Grouped by Type</Typography>
                {['classwork', 'test', 'exam'].map(type => {
                  const typeAssessments = assessments.filter(a => {
                    const matchClass = !selectedClassForView || studentIdInView(a);
                    const matchSubject = !selectedSubjectForView || a.subject === selectedSubjectForView;
                    return a.assessmentType === type && matchClass && matchSubject;
                  });
                  
                  if (typeAssessments.length === 0) return null;
                  
                  return (
                    <Box key={type} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, textTransform: 'capitalize' }}>
                        {type} ({typeAssessments.length} assessments)
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Student</TableCell>
                              <TableCell>Subject</TableCell>
                              <TableCell>Title</TableCell>
                              <TableCell>Score</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {typeAssessments.slice(0, 5).map(a => (
                              <TableRow key={a._id}>
                                <TableCell>{a.student?.firstName} {a.student?.lastName}</TableCell>
                                <TableCell>{a.subject}</TableCell>
                                <TableCell>{a.title}</TableCell>
                                <TableCell>{a.score}/{a.maxScore}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  );
                })}
              </Box>
            )}
            
            {tabValue === 3 && (
              <Box>
                {!selectedClassForView || !selectedSubjectForView ? (
                  <Alert severity="info">
                    Please select both a class and subject above to view final grades and rankings.
                  </Alert>
                ) : finalGrades.length === 0 ? (
                  <Alert severity="warning">
                    No assessments recorded yet for this class and subject.
                  </Alert>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Final Grades & Rankings - {classes.find(c => c.id === selectedClassForView)?.name} - {selectedSubjectForView}
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Position</strong></TableCell>
                            <TableCell><strong>Student</strong></TableCell>
                            <TableCell><strong>Classwork Avg</strong></TableCell>
                            <TableCell><strong>Test Avg</strong></TableCell>
                            <TableCell><strong>Exam Avg</strong></TableCell>
                            <TableCell><strong>Final Score</strong></TableCell>
                            <TableCell><strong>Grade</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {finalGrades.map((grade) => {
                            const finalScore = parseFloat(grade.finalScore);
                            let letterGrade = 'F';
                            if (finalScore >= 90) letterGrade = 'A+';
                            else if (finalScore >= 85) letterGrade = 'A';
                            else if (finalScore >= 80) letterGrade = 'B+';
                            else if (finalScore >= 75) letterGrade = 'B';
                            else if (finalScore >= 70) letterGrade = 'C+';
                            else if (finalScore >= 65) letterGrade = 'C';
                            else if (finalScore >= 60) letterGrade = 'D';
                            else if (finalScore >= 50) letterGrade = 'E';
                            
                            return (
                              <TableRow key={grade.studentId}>
                                <TableCell>
                                  <Chip
                                    label={grade.position === 1 ? '🥇 1st' : grade.position === 2 ? '🥈 2nd' : grade.position === 3 ? '🥉 3rd' : `${grade.position}th`}
                                    color={grade.position <= 3 ? 'primary' : 'default'}
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    {grade.student?.firstName} {grade.student?.lastName}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {grade.classworkAvg}%
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    ({grade.classworkCount} records)
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {grade.testAvg}%
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    ({grade.testCount} records)
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {grade.examAvg}%
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    ({grade.examCount} records)
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {grade.finalScore}%
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={letterGrade}
                                    color={
                                      letterGrade.startsWith('A') ? 'success' :
                                      letterGrade.startsWith('B') || letterGrade.startsWith('C') ? 'info' :
                                      'error'
                                    }
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
          </>
        )}

        {/* Create Assessment Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh',
              height: '90vh',
            }
          }}
        >
          <DialogTitle>
            {editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, flex: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Class</InputLabel>
                    <Select
                      value={formData.classId}
                      onChange={(e) => {
                        setFormData({ ...formData, classId: e.target.value, scores: {} });
                      }}
                      label="Select Class"
                      disabled={!!editingAssessment}
                    >
                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      label="Subject"
                      disabled={!!editingAssessment}
                    >
                      {teacherSubjects.length > 0 ? (
                        teacherSubjects.map((subject) => (
                          <MenuItem key={subject} value={subject}>
                            {subject}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No subjects assigned</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Assessment Type</InputLabel>
                    <Select
                      value={formData.assessmentType}
                      onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                      label="Assessment Type"
                      disabled={!!editingAssessment}
                    >
                      {assessmentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Term</InputLabel>
                    <Select
                      value={formData.term}
                      onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                      label="Term"
                      disabled={!!editingAssessment}
                    >
                      <MenuItem value="1st">Term 1</MenuItem>
                      <MenuItem value="2nd">Term 2</MenuItem>
                      <MenuItem value="3rd">Term 3</MenuItem>
                      <MenuItem value="final">Final</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    label="Assessment Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    fullWidth
                    placeholder="e.g. Quiz 1, Mid-term Test, Final Exam"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Max Score"
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>

              {formData.classId && formData.subject && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {editingAssessment ? 'Edit Student Score' : `Enter Scores for All Students (${students.length} students)`}
                    </Typography>
                    {!editingAssessment && (
                      <Alert severity="success" sx={{ py: 0.5, px: 2 }}>
                        <Typography variant="caption">
                          All scores will be saved at once
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                  <Box sx={{
                    height: 'calc(100vh - 480px)',
                    minHeight: '350px',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: 1,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '12px',
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: '#888',
                      borderRadius: '6px',
                      '&:hover': {
                        bgcolor: '#555',
                      }
                    },
                  }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 10 }}>
                            <strong>Student ID</strong>
                          </TableCell>
                          <TableCell sx={{ bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 10 }}>
                            <strong>Student Name</strong>
                          </TableCell>
                          <TableCell sx={{ bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 10 }}>
                            <strong>Score</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {editingAssessment ? (
                          <TableRow sx={{ bgcolor: 'background.paper' }}>
                            <TableCell>{editingAssessment.student?.studentId}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {editingAssessment.student?.firstName} {editingAssessment.student?.lastName}
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={formData.scores[formData.studentId] || ''}
                                onChange={(e) => handleScoreChange(formData.studentId, e.target.value)}
                                inputProps={{ min: 0, max: formData.maxScore }}
                                sx={{ width: 100 }}
                                placeholder="0"
                                autoFocus
                              />
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                / {formData.maxScore}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          students.map((student, index) => (
                            <TableRow 
                              key={student.id}
                              sx={{ 
                                bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                              }}
                            >
                              <TableCell>{student.studentId}</TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>{student.name}</TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={formData.scores[student.id] || ''}
                                  onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                  inputProps={{ min: 0, max: formData.maxScore }}
                                  sx={{ width: 100 }}
                                  placeholder="0"
                                />
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                  / {formData.maxScore}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.classId ||
                !formData.subject ||
                !formData.title ||
                Object.keys(formData.scores).length === 0
              }
            >
              {editingAssessment ? 'Update Score' : 'Save All Scores'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </TeacherLayout>
  );
}

export default Assessments;
