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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Save as SaveIcon,
  CalendarToday,
} from '@mui/icons-material';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { teacherAPI, attendanceAPI } from '../../config/api';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

function Attendance() {
  const [searchParams] = useSearchParams();
  const { request, loading, error } = useApi();
  const [selectedClass, setSelectedClass] = useState(searchParams.get('classId') || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  // Fetch classrooms (year · term · class) for current academic year
  useEffect(() => {
    const fetchClassrooms = async () => {
      const res = await request(teacherAPI.getClassrooms);
      if (res.success && res.data?.data) {
        setClasses(res.data.data.map(c => ({
          id: c.academicYearId,
          name: `${c.yearName} · ${c.termLabel} · ${c.classLevel}`,
          students: c.studentCount || 0,
        })));
      } else {
        setClasses([]);
      }
    };
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      const fetchStudentsAndAttendance = async () => {
        const result = await request(teacherAPI.getClassroomStudents, selectedClass);
        if (result.success && result.data?.data) {
          const formattedStudents = result.data.data.map(s => ({
            id: s._id,
            name: `${s.firstName} ${s.lastName}`,
          }));
          setStudents(formattedStudents);

          // Fetch all attendance records to find available dates
          const allAttendanceResult = await request(attendanceAPI.getAllAttendance);
          if (allAttendanceResult.success && allAttendanceResult.data?.data) {
            const uniqueDates = new Set();
            allAttendanceResult.data.data.forEach(record => {
              const studentId = record.student?._id || record.student;
              if (formattedStudents.some(s => s.id === studentId)) {
                uniqueDates.add(record.date.split('T')[0]);
              }
            });
            
            // Add today if not already included
            const today = new Date().toISOString().split('T')[0];
            uniqueDates.add(today);
            
            // Sort dates descending (newest first)
            const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));
            setAvailableDates(sortedDates);
            
            // If selected date is not in available dates, reset to today
            if (!sortedDates.includes(selectedDate)) {
              setSelectedDate(today);
            }
          }

          // Try to fetch existing attendance for this date and class
          try {
            const attendanceResult = await request(attendanceAPI.getAllAttendance, { 
              date: selectedDate,
            });

            if (attendanceResult.success && attendanceResult.data?.data && attendanceResult.data.data.length > 0) {
              // Filter records for students in the selected class
              const classAttendance = attendanceResult.data.data.filter(record => {
                const studentId = record.student?._id || record.student;
                return formattedStudents.some(s => s.id === studentId);
              });

              if (classAttendance.length > 0) {
                // Existing attendance found - load it
                setExistingAttendance(classAttendance);
                const loadedData = {};
                classAttendance.forEach((record) => {
                  const studentId = record.student?._id || record.student;
                  loadedData[studentId] = record.status;
                });
                
                // Fill in any missing students with default 'present'
                formattedStudents.forEach((student) => {
                  if (!loadedData[student.id]) {
                    loadedData[student.id] = 'present';
                  }
                });
                setAttendanceData(loadedData);
                setSaved(true); // Mark as saved since we loaded existing data
              } else {
                // No existing attendance for this class - initialize with defaults
                setExistingAttendance(null);
                const initialData = {};
                formattedStudents.forEach((student) => {
                  initialData[student.id] = 'present'; // Default to present
                });
                setAttendanceData(initialData);
                setSaved(false);
              }
            } else {
              // No existing attendance - initialize with defaults
              setExistingAttendance(null);
              const initialData = {};
              formattedStudents.forEach((student) => {
                initialData[student.id] = 'present'; // Default to present
              });
              setAttendanceData(initialData);
              setSaved(false);
            }
          } catch (error) {
            console.error('Error fetching attendance:', error);
            // If fetch fails, initialize with defaults
            setExistingAttendance(null);
            const initialData = {};
            formattedStudents.forEach((student) => {
              initialData[student.id] = 'present';
            });
            setAttendanceData(initialData);
            setSaved(false);
          }
        }
      };
      fetchStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status,
    });
    setSaved(false);
  };

  const handleMarkAllPresent = () => {
    const allPresent = {};
    students.forEach((student) => {
      allPresent[student.id] = 'present';
    });
    setAttendanceData(allPresent);
    setSaved(false);
  };

  const handleSaveAttendance = () => {
    setOpenConfirm(true);
  };

  const confirmSave = async () => {
    const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
      student: studentId,
      date: selectedDate,
      status,
    }));

    const result = await request(attendanceAPI.bulkCreateAttendance, { records: attendanceRecords });
    
    if (result.success) {
      setSaved(true);
      setOpenConfirm(false);
      // Refresh to get the latest saved data
      if (result.data?.data) {
        setExistingAttendance(result.data.data);
      }
      
      // Add current date to available dates if not already there
      if (!availableDates.includes(selectedDate)) {
        setAvailableDates([selectedDate, ...availableDates].sort((a, b) => new Date(b) - new Date(a)));
      }
    }
  };

  const presentCount = Object.values(attendanceData).filter((status) => status === 'present').length;
  const absentCount = Object.values(attendanceData).filter((status) => status === 'absent').length;

  return (
    <TeacherLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            📅 Attendance
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Mark student attendance for today
          </Typography>
        </Box>

        {classes.length === 0 && (
          <Alert severity="warning">
            You have no classrooms assigned for the current academic year. Please contact the administrator.
          </Alert>
        )}

        {classes.length > 0 && (
          <>
            {/* Class and Date Selection */}
            <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSaved(false);
                    }}
                    label="Select Class"
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.students} students)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel shrink>Date</InputLabel>
                  <Select
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSaved(false);
                    }}
                    label="Date"
                  >
                    {availableDates.length === 0 ? (
                      <MenuItem value={new Date().toISOString().split('T')[0]}>
                        Today - {new Date().toLocaleDateString()}
                      </MenuItem>
                    ) : (
                      availableDates.map((dateStr, index) => {
                        const date = new Date(dateStr + 'T12:00:00');
                        const today = new Date().toISOString().split('T')[0];
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split('T')[0];
                        
                        let label;
                        if (dateStr === today) {
                          label = 'Today';
                        } else if (dateStr === yesterdayStr) {
                          label = 'Yesterday';
                        } else {
                          label = date.toLocaleDateString('en-US', { weekday: 'short' });
                        }
                        
                        return (
                          <MenuItem key={dateStr} value={dateStr}>
                            {label} - {date.toLocaleDateString()}
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {selectedClass && (
          <>
            {/* Summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {students.length}
                  </Typography>
                  <Typography variant="body2">Total Students</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {presentCount}
                  </Typography>
                  <Typography variant="body2">Present</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {absentCount}
                  </Typography>
                  <Typography variant="body2">Absent</Typography>
                </Paper>
              </Grid>
            </Grid>

            {saved && existingAttendance && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Viewing saved attendance for this date. You can edit and update if needed.
              </Alert>
            )}
            
            {saved && !existingAttendance && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Attendance saved successfully! Parents have been notified.
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                • Click on student status to toggle between Present/Absent<br />
                • Use "Mark All Present" for quick marking<br />
                • Attendance appears on Parent dashboard instantly
              </Typography>
            </Alert>

            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Mark Attendance
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleMarkAllPresent}
                  >
                    Mark All Present
                  </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>#</strong></TableCell>
                        <TableCell><strong>Student Name</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>
                        <TableCell align="center"><strong>Quick Toggle</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student, index) => (
                        <TableRow key={student.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {student.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={attendanceData[student.id] === 'present' ? 'Present' : 'Absent'}
                              color={attendanceData[student.id] === 'present' ? 'success' : 'error'}
                              icon={
                                attendanceData[student.id] === 'present' ? (
                                  <CheckCircle />
                                ) : (
                                  <Cancel />
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleAttendanceChange(student.id, 'present')}
                                sx={{
                                  bgcolor: attendanceData[student.id] === 'present' ? 'success.light' : 'transparent',
                                }}
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleAttendanceChange(student.id, 'absent')}
                                sx={{
                                  bgcolor: attendanceData[student.id] === 'absent' ? 'error.light' : 'transparent',
                                }}
                              >
                                <Cancel />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total: {presentCount} Present, {absentCount} Absent
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAttendance}
                    disabled={loading}
                  >
                    {existingAttendance ? 'Update Attendance' : 'Save Attendance'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </>
        )}
          </>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>{existingAttendance ? 'Update Attendance' : 'Confirm Attendance'}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {existingAttendance 
                ? 'Are you sure you want to update attendance for:' 
                : 'Are you sure you want to save attendance for:'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Class: {classes.find((c) => c.id === selectedClass)?.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Date: {new Date(selectedDate).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label={`${presentCount} Present`} color="success" />
              <Chip label={`${absentCount} Absent`} color="error" />
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              Parents will be notified of absences automatically.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button onClick={confirmSave} variant="contained">
              Confirm & Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </TeacherLayout>
  );
}

export default Attendance;
