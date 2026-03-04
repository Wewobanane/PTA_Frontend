import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  Class as ClassIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';
import axios from 'axios';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [assigningTeacher, setAssigningTeacher] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [academicYearClasses, setAcademicYearClasses] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchTeachers();
    fetchAcademicYear();
    fetchTeacherRoomOptions();
  }, []);

  const fetchTeacherRoomOptions = async () => {
    try {
      const response = await api.get('/admin/lookups/teacher-rooms');
      if (response.data?.success) {
        setRoomOptions(response.data.data || []);
      }
    } catch (err) {
      // Optional: if this fails, rooms can still be typed manually
      console.error('Failed to fetch room options:', err);
    }
  };

  const fetchAcademicYear = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/academic-years/current`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success && response.data.data) {
        setAcademicYear(response.data.data);
        if (response.data.data.classes && Array.isArray(response.data.data.classes)) {
          const cleaned = Array.from(
            new Set(
              response.data.data.classes
                .map(c => (typeof c === 'string' ? c.trim() : String(c).trim()))
                .filter(Boolean)
            )
          ).sort((a, b) => a.localeCompare(b));
          setAcademicYearClasses(cleaned);
        } else {
          setAcademicYearClasses([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch academic year:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/users`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        params: { 
          role: 'teacher',
          _t: new Date().getTime() // Cache buster
        }
      });
      console.log('Fetched teachers:', response.data.data);
      setTeachers(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch teachers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenDialog = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: ''
    });
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeacher(null);
  };

  const handleOpenAssignDialog = (teacher) => {
    setAssigningTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      classesTeaching: teacher.classesTeaching || [],
      rooms: Array.isArray(teacher.rooms)
        ? teacher.rooms
        : (teacher.rooms ? [teacher.rooms] : (teacher.room ? teacher.room.split(',').map(r => r.trim()) : [])),
    });
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setAssigningTeacher(null);
  };

  const handleResendInvitation = async (teacherId) => {
    try {
      setLoading(true);
      await api.post('/admin/resend-invitation', { userId: teacherId });
      setSuccess('Invitation email sent successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to resend invitation');
      console.error(err);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (editingTeacher) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
        const updateData = { 
          name: formData.name, 
          email: formData.email
        };
        
        console.log('Updating teacher with data:', updateData);
        
        const response = await axios.put(
          `${API_URL}/users/${editingTeacher._id || editingTeacher.id}`,
          updateData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        
        console.log('Update response:', response.data);
        
        if (response.data.success) {
          // Update local state immediately with the returned data
          setTeachers(prevTeachers => 
            prevTeachers.map(t => 
              (t._id === response.data.data._id || t.id === response.data.data._id) 
                ? response.data.data
                : t
            )
          );
          
          setSuccess('Teacher updated successfully!');
          handleCloseDialog();
          // Also fetch fresh data to ensure sync
          setTimeout(() => fetchTeachers(), 100);
        }
      } else {
        const response = await api.post('/admin/teachers', {
          name: formData.name,
          email: formData.email
        });
        if (response.data.success) {
          setSuccess('Teacher invitation sent successfully!');
          handleCloseDialog();
          fetchTeachers();
        } else {
          setError('Failed to send invitation');
        }
      }
    } catch (err) {
      console.error('Teacher submit error:', err);
      setError(err.response?.data?.message || `Failed to ${editingTeacher ? 'update' : 'invite'} teacher`);
    }
  };

  const handleAssignClasses = async () => {
    try {
      setError('');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
      
      const updateData = {
        classesTeaching: formData.classesTeaching,
        rooms: formData.rooms,
      };
      
      console.log('Assigning classes with data:', updateData);
      
      const response = await axios.put(
        `${API_URL}/users/${assigningTeacher._id || assigningTeacher.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      console.log('Assign classes response:', response.data);
      
      if (response.data.success) {
        setTeachers(prevTeachers => 
          prevTeachers.map(t => 
            (t._id === response.data.data._id || t.id === response.data.data._id) 
              ? response.data.data
              : t
          )
        );
        
        setSuccess('Classes and rooms assigned successfully!');
        handleCloseAssignDialog();
        setTimeout(() => fetchTeachers(), 100);
      }
    } catch (err) {
      console.error('Assign classes error:', err);
      setError(err.response?.data?.message || 'Failed to assign classes');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Teacher deleted successfully');
      fetchTeachers();
    } catch (err) {
      setError('Failed to delete teacher');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              👩‍🏫 Teacher Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage teachers, their classes, and subjects
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            size="large"
          >
            Add Teacher
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Paper elevation={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : teachers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>
                No teachers found. Click "Add Teacher" to create one.
              </Typography>
            </Box>
          ) : (
            <Box>
              {teachers.map((teacher) => (
                <Accordion 
                  key={teacher._id || teacher.id}
                  expanded={expandedTeacher === (teacher._id || teacher.id)}
                  onChange={(e, isExpanded) => setExpandedTeacher(isExpanded ? (teacher._id || teacher.id) : null)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <SchoolIcon color="primary" />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {teacher.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {teacher.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={teacher.status || (teacher.isActive ? 'Active' : 'Inactive')}
                          color={
                            teacher.status === 'INVITED' ? 'warning' :
                            teacher.status === 'ACTIVE' || teacher.isActive ? 'success' : 
                            teacher.status === 'SUSPENDED' ? 'error' : 'default'
                          }
                          size="small"
                          icon={teacher.status === 'INVITED' ? <EmailIcon /> : undefined}
                        />
                        {(teacher.classesTeaching && teacher.classesTeaching.length > 0) && (
                          <Chip
                            icon={<ClassIcon />}
                            label={`${teacher.classesTeaching.length} Classes`}
                            size="small"
                            color="info"
                          />
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <BookIcon color="primary" />
                            Teaching Information
                          </Typography>
                          
                          <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                                📚 SUBJECTS
                              </Typography>
                              {teacher.subject && (Array.isArray(teacher.subject) ? teacher.subject : [teacher.subject]).length > 0 ? (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                  {(Array.isArray(teacher.subject) ? teacher.subject : [teacher.subject]).map((subj, idx) => (
                                    <Chip key={idx} label={subj} color="primary" variant="filled" />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No subjects assigned
                                </Typography>
                              )}
                            </Grid>
                            
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                                🎓 CLASSES
                              </Typography>
                              {teacher.classesTeaching && teacher.classesTeaching.length > 0 ? (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                  {teacher.classesTeaching.map((cls, idx) => (
                                    <Chip key={idx} label={cls} color="secondary" variant="filled" />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No classes assigned
                                </Typography>
                              )}
                            </Grid>
                            
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                                🏫 ROOMS
                              </Typography>
                              {(teacher.rooms && teacher.rooms.length > 0) || teacher.room ? (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                  {(Array.isArray(teacher.rooms) && teacher.rooms.length > 0
                                    ? teacher.rooms
                                    : (teacher.room ? teacher.room.split(',').map(r => r.trim()).filter(Boolean) : [])
                                  ).map((rm, idx) => (
                                    <Chip key={idx} label={rm} color="info" variant="filled" />
                                  ))}
                                </Box>
                              ) : null}
                            </Grid>
                          </Grid>
                          
                          <Alert severity="info" sx={{ mt: 3 }}>
                            This teacher can teach any of their {(Array.isArray(teacher.subject) ? teacher.subject : [teacher.subject]).filter(Boolean).length} subject(s) to any of their {teacher.classesTeaching?.length || 0} class(es) in any of their {(Array.isArray(teacher.rooms) ? teacher.rooms : (teacher.room ? teacher.room.split(',').map(r => r.trim()) : [])).filter(Boolean).length} room(s).
                          </Alert>
                        </Paper>
                      </Grid>
                      
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            CONTACT INFORMATION
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Email" 
                                secondary={teacher.email}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Phone" 
                                secondary={teacher.phone || 'Not provided'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Status" 
                                secondary={teacher.status || (teacher.isActive ? 'Active' : 'Inactive')}
                              />
                            </ListItem>
                          </List>
                        </Paper>
                      </Grid>
                      
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            TEACHER INFORMATION
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Full Name" 
                                secondary={teacher.name}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Total Classes" 
                                secondary={teacher.classesTeaching?.length || 0}
                              />
                            </ListItem>
                          </List>
                        </Paper>
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {teacher.status === 'INVITED' && (
                            <Button
                              size="small"
                              color="warning"
                              startIcon={<SendIcon />}
                              onClick={() => handleResendInvitation(teacher._id || teacher.id)}
                            >
                              Resend Invitation
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ClassIcon />}
                            onClick={() => handleOpenAssignDialog(teacher)}
                          >
                            Assign Classes/Rooms
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              setEditingTeacher(teacher);
                              setFormData({
                                name: teacher.name,
                                email: teacher.email
                              });
                              setOpenDialog(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(teacher._id || teacher.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Paper>

        {/* Add/Edit Teacher Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={!formData.name || !formData.email}
            >
              {editingTeacher ? 'Update Teacher' : 'Create Teacher'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Classes Dialog */}
        <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog} maxWidth="md" fullWidth>
          <DialogTitle>Assign Classes & Rooms</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {academicYear && (
                <Alert severity="info">
                  <Typography variant="body2">
                    Current Academic Year:&nbsp;
                    <strong>{academicYear.name || academicYear.year}</strong>
                  </Typography>
                  {academicYearClasses.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {academicYearClasses.map((cls) => (
                        <Chip key={cls} label={cls} size="small" color="secondary" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </Alert>
              )}
              
              <Alert severity="info">
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  How it works:
                </Typography>
                <Typography variant="body2">
                  • Teacher sets their <strong>subjects and phone</strong> on their own dashboard.<br/>
                  • Here, you only assign <strong>classes</strong> they will teach and optional <strong>rooms</strong>.<br/>
                  <br/>
                  Subjects shown below come from the teacher profile and are read-only.
                </Typography>
              </Alert>

              {assigningTeacher && (
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Subjects (from teacher profile)
                  </Typography>
                  {assigningTeacher.subject && (Array.isArray(assigningTeacher.subject) ? assigningTeacher.subject : [assigningTeacher.subject]).filter(Boolean).length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(Array.isArray(assigningTeacher.subject) ? assigningTeacher.subject : [assigningTeacher.subject]).filter(Boolean).map((subj, idx) => (
                        <Chip key={idx} label={subj} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No subjects set yet. Teacher must complete their profile.
                    </Typography>
                  )}
                </Box>
              )}
              
              <Autocomplete
                multiple
                options={academicYearClasses}
                value={formData.classesTeaching || []}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, classesTeaching: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Classes"
                    placeholder={academicYearClasses.length ? 'Select class(es)' : 'No classes found in database'}
                    helperText="Classes come from the database (students/academic year)"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip key={key} label={option} {...tagProps} color="secondary" size="medium" />
                    );
                  })
                }
              />

              <Autocomplete
                multiple
                freeSolo
                options={roomOptions}
                value={formData.rooms || []}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, rooms: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rooms (Optional)"
                    placeholder="Type room name(s) (optional)"
                    helperText={roomOptions.length ? 'Select existing rooms or type new ones (optional)' : 'Type room name(s) if needed (optional)'}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip key={key} label={option} {...tagProps} color="info" size="medium" />
                    );
                  })
                }
              />

              {(formData.classesTeaching?.length > 0 || formData.rooms?.length > 0) && (
                <Alert severity="success">
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Summary:
                  </Typography>
                  <Typography variant="body2">
                    • {formData.classesTeaching?.length || 0} class(es)<br/>
                    • {formData.rooms?.length || 0} room(s)
                  </Typography>
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAssignDialog}>Cancel</Button>
            <Button 
              onClick={handleAssignClasses} 
              variant="contained"
              disabled={!formData.classesTeaching?.length}
            >
              Save Assignments
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default Teachers;
