import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as PromoteIcon,
  SwapHoriz as ChangeTermIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from 'axios';

function AcademicYearManagement() {
  // State management
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [terms, setTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Dialog states
  const [openYearDialog, setOpenYearDialog] = useState(false);
  const [openTermDialog, setOpenTermDialog] = useState(false);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [openChangeTermDialog, setOpenChangeTermDialog] = useState(false);
  const [openPromoteDialog, setOpenPromoteDialog] = useState(false);
  
  // Form states
  const [editingYear, setEditingYear] = useState(null);
  const [editingTerm, setEditingTerm] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [yearFormData, setYearFormData] = useState({
    name: '',
    classLevel: '',
  });
  
  const [termFormData, setTermFormData] = useState({
    termNumber: 1,
    startDate: '',
    endDate: '',
  });
  
  const [studentFormData, setStudentFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    class: '',
    section: 'A',
  });
  
  const [promoteFormData, setPromoteFormData] = useState({
    newYearName: '',
    newClassLevel: '',
  });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchTerms(selectedYear._id || selectedYear.id);
      fetchStudents(selectedYear._id || selectedYear.id);
    }
  }, [selectedYear]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/academic-years`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const years = response.data.data || [];
      setAcademicYears(years);
      
      // Update selectedYear if it exists in the new data
      if (selectedYear) {
        const updatedSelectedYear = years.find(y => 
          (y._id === selectedYear._id || y.id === selectedYear.id)
        );
        if (updatedSelectedYear) {
          setSelectedYear(updatedSelectedYear);
        }
      } else if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (err) {
      console.error('Failed to fetch academic years:', err);
      setAcademicYears([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTerms = async (yearId) => {
    try {
      const response = await axios.get(`${API_URL}/academic-years/${yearId}/terms`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTerms(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch terms:', err);
      setTerms([]);
    }
  };

  const fetchStudents = async (yearId) => {
    try {
      const response = await axios.get(`${API_URL}/academic-years/${yearId}/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStudents(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
    }
  };

  // Academic Year handlers
  const handleOpenYearDialog = () => {
    setEditingYear(null);
    setYearFormData({ name: '', classLevel: '' });
    setOpenYearDialog(true);
    setError('');
  };

  // Open dialog to add a new class level under the currently selected year name
  const handleOpenClassForSelectedYear = () => {
    if (!selectedYearName) {
      setError('Please select or create an academic year name first.');
      return;
    }
    setEditingYear(null);
    setYearFormData({ name: selectedYearName, classLevel: '' });
    setOpenYearDialog(true);
    setError('');
  };

  // Mark the currently selected year name as the "current" year used by Teacher page
  const handleSetCurrentYear = async () => {
    if (!selectedYearName) {
      setError('Please select a year first.');
      return;
    }
    try {
      setError('');
      await axios.put(
        `${API_URL}/academic-years/set-current`,
        { name: selectedYearName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess(`Set ${selectedYearName} as the current academic year (used in Teacher view).`);
      await fetchAcademicYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set current academic year');
    }
  };

  const handleSubmitYear = async () => {
    if (!yearFormData.name || !yearFormData.classLevel) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      if (editingYear) {
        await axios.put(
          `${API_URL}/academic-years/${editingYear._id || editingYear.id}`,
          yearFormData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setSuccess('Academic year updated successfully!');
      } else {
        await axios.post(
          `${API_URL}/academic-years`,
          { ...yearFormData, currentTermNumber: null },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setSuccess('Academic year created successfully!');
      }
      setOpenYearDialog(false);
      fetchAcademicYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save academic year');
    }
  };

  const handleDeleteYear = async (id) => {
    if (!window.confirm('Are you sure? This will delete all terms and student associations for this academic year.')) return;
    
    try {
      await axios.delete(`${API_URL}/academic-years/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Academic year deleted successfully');
      fetchAcademicYears();
      if (selectedYear && (selectedYear._id === id || selectedYear.id === id)) {
        setSelectedYear(null);
      }
    } catch (err) {
      setError('Failed to delete academic year');
    }
  };

  // Term handlers
  const handleOpenTermDialog = () => {
    setEditingTerm(null);
    setTermFormData({ termNumber: 1, startDate: '', endDate: '' });
    setOpenTermDialog(true);
    setError('');
  };

  const handleSubmitTerm = async () => {
    if (!termFormData.termNumber || !termFormData.startDate || !termFormData.endDate) {
      setError('Please fill in all fields');
      return;
    }

    if (new Date(termFormData.startDate) >= new Date(termFormData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setError('');
      const termData = {
        ...termFormData,
        academicYearId: selectedYear._id || selectedYear.id,
      };

      if (editingTerm) {
        await axios.put(
          `${API_URL}/academic-years/${selectedYear._id || selectedYear.id}/terms/${editingTerm._id || editingTerm.id}`,
          termData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setSuccess('Term updated successfully!');
      } else {
        await axios.post(
          `${API_URL}/academic-years/${selectedYear._id || selectedYear.id}/terms`,
          termData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setSuccess('Term created successfully!');
      }
      setOpenTermDialog(false);
      fetchTerms(selectedYear._id || selectedYear.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save term');
    }
  };

  const handleDeleteTerm = async (termId) => {
    if (!window.confirm('Are you sure you want to delete this term?')) return;
    
    try {
      await axios.delete(
        `${API_URL}/academic-years/${selectedYear._id || selectedYear.id}/terms/${termId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Term deleted successfully');
      fetchTerms(selectedYear._id || selectedYear.id);
    } catch (err) {
      setError('Failed to delete term');
    }
  };

  // Student handlers
  const handleOpenStudentDialog = () => {
    setEditingStudent(null);
    setStudentFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      class: '',
      section: 'A',
    });
    setOpenStudentDialog(true);
    setError('');
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
      gender: student.gender,
      class: student.class,
      section: student.section || 'A',
    });
    setOpenStudentDialog(true);
    setError('');
  };

  const handleSubmitStudent = async () => {
    if (!studentFormData.firstName || !studentFormData.lastName || !studentFormData.class) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      const studentData = {
        ...studentFormData,
        academicYearId: selectedYear._id || selectedYear.id,
        currentTermNumber: selectedYear.currentTermNumber || null,
      };

      if (editingStudent) {
        await axios.put(
          `${API_URL}/students/${editingStudent._id || editingStudent.id}`,
          studentData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setSuccess('Student updated successfully!');
      } else {
        await axios.post(
          `${API_URL}/students`,
          studentData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setSuccess('Student created successfully!');
      }
      setOpenStudentDialog(false);
      fetchStudents(selectedYear._id || selectedYear.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await axios.delete(`${API_URL}/students/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Student deleted successfully');
      fetchStudents(selectedYear._id || selectedYear.id);
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  // Change current term for all students
  const handleChangeTerm = async (newTermNumber) => {
    try {
      setError('');
      const response = await axios.put(
        `${API_URL}/academic-years/${selectedYear._id || selectedYear.id}/change-term`,
        { termNumber: newTermNumber },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Update selectedYear with the fresh data from response
      const updatedYear = response.data.data;
      if (updatedYear) {
        // Update selectedYear state
        setSelectedYear(updatedYear);
        
        // Update academicYears array to reflect the change
        setAcademicYears(prev => prev.map(year => 
          (year._id === updatedYear._id || year.id === updatedYear.id) ? updatedYear : year
        ));
      }
      
      setSuccess(`All students moved to Term ${newTermNumber}!`);
      setOpenChangeTermDialog(false);
      
      // Refresh students to see updated currentTermNumber
      await fetchStudents(selectedYear._id || selectedYear.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change term');
    }
  };

  // Promote entire academic year
  const handlePromoteYear = async () => {
    if (!promoteFormData.newYearName || !promoteFormData.newClassLevel) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      await axios.post(
        `${API_URL}/academic-years/${selectedYear._id || selectedYear.id}/promote`,
        promoteFormData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess(`Academic year promoted! ${students.length} students moved to ${promoteFormData.newYearName}`);
      setOpenPromoteDialog(false);
      fetchAcademicYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to promote academic year');
    }
  };

  const currentTerm = selectedYear ? terms.find(t => t.termNumber === selectedYear.currentTermNumber) : null;
  const studentsInCurrentTerm = currentTerm ? students.filter(s => s.currentTermNumber === currentTerm.termNumber) : students;

  // Group years by name so admin can pick year, then class level
  const uniqueYearNames = Array.from(
    new Set(academicYears.map((y) => y.name).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const selectedYearName = selectedYear?.name || uniqueYearNames[0] || null;

  const classLevelsForSelectedYear = selectedYearName
    ? academicYears
        .filter((y) => y.name === selectedYearName)
        .map((y) => y.classLevel)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
    : [];

  // Class dropdown options for student dialog: use current classLevel plus existing student classes
  const classOptions = React.useMemo(() => {
    if (!selectedYear) return [];
    const base = [selectedYear.classLevel].filter(Boolean);
    const fromStudents = Array.from(
      new Set(
        students
          .map((s) => s.class)
          .filter(Boolean)
      )
    );
    return Array.from(new Set([...base, ...fromStudents])).sort((a, b) => a.localeCompare(b));
  }, [selectedYear, students]);

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              📚 Academic Year Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage academic years, terms, and students in one place
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenYearDialog}
            size="large"
          >
            New Academic Year
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : academicYears.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Academic Years Created Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first academic year to start managing terms and students
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenYearDialog}>
              Create First Academic Year
            </Button>
          </Paper>
        ) : (
          <>
            {/* Academic Year & Class Selector */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    STEP 1: SELECT YEAR
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {uniqueYearNames.map((name) => {
                      const isActive = selectedYearName === name;
                      return (
                        <Chip
                          key={name}
                          label={name}
                          onClick={() => {
                            const firstForYear = academicYears.find((y) => y.name === name);
                            if (firstForYear) {
                              setSelectedYear(firstForYear);
                            }
                          }}
                          color={isActive ? 'primary' : 'default'}
                          variant={isActive ? 'filled' : 'outlined'}
                          sx={{ fontSize: '0.95rem', py: 1.5, px: 2 }}
                        />
                      );
                    })}
                  </Box>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    STEP 2: SELECT CLASS IN {selectedYearName || 'YEAR'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedYearName && classLevelsForSelectedYear.length > 0 ? (
                      academicYears
                        .filter((y) => y.name === selectedYearName)
                        .map((year) => {
                          const isActive =
                            selectedYear &&
                            (selectedYear._id === year._id || selectedYear.id === year.id);
                          return (
                            <Chip
                              key={year._id || year.id}
                              label={year.classLevel}
                              onClick={() => setSelectedYear(year)}
                              color={isActive ? 'primary' : 'default'}
                              variant={isActive ? 'filled' : 'outlined'}
                              sx={{ fontSize: '0.95rem', py: 1.5, px: 2 }}
                              onDelete={() => handleDeleteYear(year._id || year.id)}
                            />
                          );
                        })
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No classes created yet for this year.
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleOpenClassForSelectedYear}
                      disabled={!selectedYearName}
                    >
                      Add Class Level to This Year
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      CURRENT SELECTION
                    </Typography>
                    <Typography variant="body2">
                      <strong>Year:</strong> {selectedYear?.name || 'None'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Class:</strong> {selectedYear?.classLevel || 'None'}
                    </Typography>
                    <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                    <Typography variant="subtitle2" gutterBottom>
                      CURRENT TERM
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {currentTerm ? `Term ${currentTerm.termNumber}` : 'Not Set'}
                    </Typography>
                    {currentTerm && (
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        {new Date(currentTerm.startDate).toLocaleDateString()} - {new Date(currentTerm.endDate).toLocaleDateString()}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="inherit"
                        onClick={handleSetCurrentYear}
                        disabled={!selectedYearName}
                      >
                        Set as Current Year (Teachers)
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {selectedYear && (
              <>
                {/* Action Bar */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleOpenTermDialog}
                    >
                      Add Term
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleOpenStudentDialog}
                    >
                      Add Student
                    </Button>
                    {terms.length > 0 && (
                      <Button
                        variant="outlined"
                        startIcon={<ChangeTermIcon />}
                        onClick={() => setOpenChangeTermDialog(true)}
                        color="info"
                      >
                        Change Current Term
                      </Button>
                    )}
                    {students.length > 0 && (
                      <Button
                        variant="outlined"
                        startIcon={<PromoteIcon />}
                        onClick={() => {
                          setPromoteFormData({ newYearName: '', newClassLevel: '' });
                          setOpenPromoteDialog(true);
                        }}
                        color="success"
                      >
                        Promote to Next Year
                      </Button>
                    )}
                  </Box>
                </Paper>

                {/* Tabs */}
                <Paper sx={{ mb: 3 }}>
                  <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
                    <Tab label={`Terms (${terms.length})`} />
                    <Tab label={`Students (${students.length})`} />
                  </Tabs>
                </Paper>

                {/* Terms Tab */}
                {currentTab === 0 && (
                  <Paper elevation={2}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Term</strong></TableCell>
                            <TableCell><strong>Start Date</strong></TableCell>
                            <TableCell><strong>End Date</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {terms.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography color="text.secondary">
                                  No terms created yet. Click "Add Term" to create one.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            terms
                              .sort((a, b) => a.termNumber - b.termNumber)
                              .map((term) => (
                                <TableRow 
                                  key={term._id || term.id}
                                  sx={{ 
                                    bgcolor: term.termNumber === selectedYear.currentTermNumber ? 'action.selected' : 'inherit'
                                  }}
                                >
                                  <TableCell>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                      Term {term.termNumber}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>{new Date(term.startDate).toLocaleDateString()}</TableCell>
                                  <TableCell>{new Date(term.endDate).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    {term.termNumber === selectedYear.currentTermNumber && (
                                      <Chip label="Current" color="primary" size="small" />
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => {
                                        setEditingTerm(term);
                                        setTermFormData({
                                          termNumber: term.termNumber,
                                          startDate: term.startDate,
                                          endDate: term.endDate,
                                        });
                                        setOpenTermDialog(true);
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteTerm(term._id || term.id)}
                                      disabled={term.termNumber === selectedYear.currentTermNumber}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}

                {/* Students Tab */}
                {currentTab === 1 && (
                  <Paper elevation={2}>
                    {currentTerm && (
                      <Box sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                        <Typography variant="body2">
                          📍 Showing students for <strong>Term {currentTerm.termNumber}</strong> (Current Term)
                        </Typography>
                      </Box>
                    )}
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Class</strong></TableCell>
                            <TableCell><strong>Gender</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {students.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography color="text.secondary">
                                  No students in this academic year. Click "Add Student" to add one.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            students.map((student) => (
                              <TableRow key={student._id || student.id}>
                                <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                                <TableCell>{`${student.class} ${student.section}`}</TableCell>
                                <TableCell>{student.gender}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={student.isActive ? 'Active' : 'Inactive'}
                                    color={student.isActive ? 'success' : 'default'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditStudent(student)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteStudent(student._id || student.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </>
            )}
          </>
        )}

        {/* Create/Edit Academic Year Dialog */}
        <Dialog open={openYearDialog} onClose={() => setOpenYearDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingYear ? 'Edit Academic Year' : 'Create New Academic Year'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Academic Year Name"
                value={yearFormData.name}
                onChange={(e) => setYearFormData({ ...yearFormData, name: e.target.value })}
                placeholder="e.g., 2025/2026"
                fullWidth
                required
              />
              <TextField
                label="Class Level"
                value={yearFormData.classLevel}
                onChange={(e) => setYearFormData({ ...yearFormData, classLevel: e.target.value })}
                placeholder="e.g., JSS1"
                fullWidth
                required
                helperText="The grade/class for this cohort"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenYearDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitYear} variant="contained">
              {editingYear ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create/Edit Term Dialog */}
        <Dialog open={openTermDialog} onClose={() => setOpenTermDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingTerm ? 'Edit Term' : 'Add New Term'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Term Number</InputLabel>
                <Select
                  value={termFormData.termNumber}
                  onChange={(e) => setTermFormData({ ...termFormData, termNumber: e.target.value })}
                  label="Term Number"
                >
                  <MenuItem value={1}>Term 1</MenuItem>
                  <MenuItem value={2}>Term 2</MenuItem>
                  <MenuItem value={3}>Term 3</MenuItem>
                  <MenuItem value={4}>Term 4</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Start Date"
                type="date"
                value={termFormData.startDate}
                onChange={(e) => setTermFormData({ ...termFormData, startDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={termFormData.endDate}
                onChange={(e) => setTermFormData({ ...termFormData, endDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTermDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitTerm} variant="contained">
              {editingTerm ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create/Edit Student Dialog */}
        <Dialog open={openStudentDialog} onClose={() => setOpenStudentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="First Name"
                  value={studentFormData.firstName}
                  onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Last Name"
                  value={studentFormData.lastName}
                  onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })}
                  fullWidth
                  required
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Date of Birth"
                  type="date"
                  value={studentFormData.dateOfBirth}
                  onChange={(e) => setStudentFormData({ ...studentFormData, dateOfBirth: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={studentFormData.gender}
                    onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value })}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={studentFormData.class}
                    label="Class"
                    onChange={(e) => setStudentFormData({ ...studentFormData, class: e.target.value })}
                  >
                    {classOptions.length === 0 && (
                      <MenuItem value="">
                        <em>No classes yet for this year</em>
                      </MenuItem>
                    )}
                    {classOptions.map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        {cls}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TextField
                label="Section"
                value={studentFormData.section}
                onChange={(e) => setStudentFormData({ ...studentFormData, section: e.target.value })}
                fullWidth
                placeholder="A, B, C, etc."
              />
              {currentTerm && (
                <Alert severity="info">
                  Student will be automatically assigned to <strong>Term {currentTerm.termNumber}</strong> (Current Term)
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStudentDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitStudent} variant="contained">
              {editingStudent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Term Dialog */}
        <Dialog open={openChangeTermDialog} onClose={() => setOpenChangeTermDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>🔄 Change Current Term</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                This will move <strong>ALL {students.length} students</strong> to the selected term
              </Alert>
              <Typography variant="subtitle2" gutterBottom>
                Select New Current Term:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {terms
                  .sort((a, b) => a.termNumber - b.termNumber)
                  .map((term) => (
                    <Button
                      key={term._id || term.id}
                      variant={term.termNumber === selectedYear?.currentTermNumber ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => handleChangeTerm(term.termNumber)}
                      disabled={term.termNumber === selectedYear?.currentTermNumber}
                    >
                      Term {term.termNumber} ({new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()})
                      {term.termNumber === selectedYear?.currentTermNumber && ' (Current)'}
                    </Button>
                  ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenChangeTermDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Promote Year Dialog */}
        <Dialog open={openPromoteDialog} onClose={() => setOpenPromoteDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>🎓 Promote to Next Academic Year</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                This will create a new academic year and move <strong>ALL {students.length} students</strong> together
              </Alert>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="New Academic Year Name"
                  value={promoteFormData.newYearName}
                  onChange={(e) => setPromoteFormData({ ...promoteFormData, newYearName: e.target.value })}
                  placeholder="e.g., 2026/2027"
                  fullWidth
                  required
                />
                <TextField
                  label="New Class Level"
                  value={promoteFormData.newClassLevel}
                  onChange={(e) => setPromoteFormData({ ...promoteFormData, newClassLevel: e.target.value })}
                  placeholder="e.g., JSS2"
                  fullWidth
                  required
                  helperText="The next grade level for these students"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPromoteDialog(false)}>Cancel</Button>
            <Button onClick={handlePromoteYear} variant="contained" color="success">
              Promote {students.length} Students
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default AcademicYearManagement;
