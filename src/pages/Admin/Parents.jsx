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
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Avatar,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Link as LinkIcon,
  Email as EmailIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  ChildCare as ChildIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../config/api';
import axios from 'axios';

function Parents() {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [linkingParent, setLinkingParent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedParent, setExpandedParent] = useState(null);
  const [selectedChildren, setSelectedChildren] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'parent',
  });

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { role: 'parent' }
      });
      
      // Populate children for each parent
      const parentsWithChildren = await Promise.all(
        (response.data.data || []).map(async (parent) => {
          if (parent.children && parent.children.length > 0) {
            try {
              const childrenData = await Promise.all(
                parent.children.map(async (child) => {
                  try {
                    // Check if child is already an object or just an ID
                    if (typeof child === 'object' && child !== null) {
                      return child; // Already populated
                    }
                    // Fetch the student data
                    const studentRes = await axios.get(
                      `${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/students/${child}`,
                      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    );
                    return studentRes.data.data;
                  } catch {
                    return null;
                  }
                })
              );
              return { ...parent, childrenData: childrenData.filter(Boolean) };
            } catch {
              return { ...parent, childrenData: [] };
            }
          }
          return { ...parent, childrenData: [] };
        })
      );
      
      setParents(parentsWithChildren);
    } catch (err) {
      setError('Failed to fetch parents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStudents(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenDialog = () => {
    setEditingParent(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'parent',
    });
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingParent(null);
  };

  const handleOpenLinkDialog = (parent) => {
    setLinkingParent(parent);
    // Extract IDs from children (handle both object and string formats)
    const childIds = (parent.children || []).map(child => 
      typeof child === 'string' ? child : (child._id || child.id)
    );
    setSelectedChildren(childIds);
    setOpenLinkDialog(true);
  };

  const handleCloseLinkDialog = () => {
    setOpenLinkDialog(false);
    setLinkingParent(null);
    setSelectedChildren([]);
  };

  const handleResendInvitation = async (parentId) => {
    try {
      setLoading(true);
      await api.post('/admin/resend-invitation', { userId: parentId });
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
      
      if (editingParent) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
        const updateData = { 
          name: formData.name, 
          email: formData.email,
          phone: formData.phone
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        const response = await axios.put(
          `${API_URL}/users/${editingParent._id || editingParent.id}`,
          updateData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        
        if (response.data.success) {
          setSuccess('Parent updated successfully!');
          handleCloseDialog();
          fetchParents();
        }
      } else {
        const response = await api.post('/admin/parents', formData);
        if (response.data.success) {
          setSuccess('Parent invitation sent successfully!');
          handleCloseDialog();
          fetchParents();
        } else {
          setError('Failed to send invitation');
        }
      }
    } catch (err) {
      console.error('Parent submit error:', err);
      setError(err.response?.data?.message || `Failed to ${editingParent ? 'update' : 'invite'} parent`);
    }
  };

  const handleLinkChildren = async () => {
    try {
      setError('');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
      const parentId = linkingParent._id || linkingParent.id;
      
      // Update each student with parent reference first
      await Promise.all(
        selectedChildren.map(async (child) => {
          try {
            // Extract ID (handle both object and string)
            const childId = typeof child === 'string' ? child : (child._id || child.id);
            
            // Get current student data
            const studentRes = await axios.get(
              `${API_URL}/students/${childId}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            
            const student = studentRes.data.data;
            const currentParents = student.parents || [];
            
            // Add parent if not already linked
            if (!currentParents.includes(parentId)) {
              await axios.put(
                `${API_URL}/students/${childId}`,
                { parents: [...currentParents, parentId] },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );
            }
          } catch (err) {
            console.error('Error linking student:', err);
          }
        })
      );
      
      // Update parent with new children (ensure IDs only)
      const childIds = selectedChildren.map(child => 
        typeof child === 'string' ? child : (child._id || child.id)
      );
      const response = await axios.put(
        `${API_URL}/users/${parentId}`,
        { children: childIds },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      if (response.data.success) {
        setSuccess('Children linked successfully!');
        handleCloseLinkDialog();
        await fetchParents(); // Wait for refresh to complete
      }
    } catch (err) {
      console.error('Link children error:', err);
      setError(err.response?.data?.message || 'Failed to link children');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parent account?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Parent account deleted successfully');
      fetchParents();
    } catch (err) {
      setError('Failed to delete parent account');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              👨‍👩‍👧 Parent Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage parents and their children
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            size="large"
          >
            Add Parent
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Paper elevation={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : parents.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>
                No parent accounts found. Click "Add Parent" to create one.
              </Typography>
            </Box>
          ) : (
            <Box>
              {parents.map((parent) => (
                <Accordion 
                  key={parent._id || parent.id}
                  expanded={expandedParent === (parent._id || parent.id)}
                  onChange={(e, isExpanded) => setExpandedParent(isExpanded ? (parent._id || parent.id) : null)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {parent.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {parent.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={parent.status || (parent.isActive ? 'Active' : 'Inactive')}
                          color={
                            parent.status === 'INVITED' ? 'warning' :
                            parent.status === 'ACTIVE' || parent.isActive ? 'success' : 
                            parent.status === 'SUSPENDED' ? 'error' : 'default'
                          }
                          size="small"
                          icon={parent.status === 'INVITED' ? <EmailIcon /> : undefined}
                        />
                        {(parent.childrenData && parent.childrenData.length > 0) && (
                          <Chip
                            icon={<ChildIcon />}
                            label={`${parent.childrenData.length} Children`}
                            size="small"
                            color="info"
                          />
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ChildIcon fontSize="small" />
                            CHILDREN
                          </Typography>
                          {parent.childrenData && parent.childrenData.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                              {parent.childrenData.map((child) => (
                                <Card key={child._id} variant="outlined">
                                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                          {child.firstName} {child.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {child.class} {child.section}
                                        </Typography>
                                      </Box>
                                      <Chip
                                        label={child.gender}
                                        size="small"
                                        color={child.gender === 'male' ? 'info' : 'secondary'}
                                      />
                                    </Box>
                                  </CardContent>
                                </Card>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              No children linked yet
                            </Typography>
                          )}
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
                                secondary={parent.email}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Phone" 
                                secondary={parent.phone || 'Not provided'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Status" 
                                secondary={parent.status || (parent.isActive ? 'Active' : 'Inactive')}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Number of Children" 
                                secondary={parent.childrenData?.length || 0}
                              />
                            </ListItem>
                          </List>
                        </Paper>
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {parent.status === 'INVITED' && (
                            <Button
                              size="small"
                              color="warning"
                              startIcon={<SendIcon />}
                              onClick={() => handleResendInvitation(parent._id || parent.id)}
                            >
                              Resend Invitation
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LinkIcon />}
                            onClick={() => handleOpenLinkDialog(parent)}
                          >
                            Link to Children
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              setEditingParent(parent);
                              setFormData({
                                name: parent.name,
                                email: parent.email,
                                password: '',
                                phone: parent.phone || '',
                                role: 'parent',
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
                            onClick={() => handleDelete(parent._id || parent.id)}
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

        {/* Add/Edit Parent Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingParent ? 'Edit Parent' : 'Add New Parent'}</DialogTitle>
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
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required={!editingParent}
                helperText={editingParent ? "Leave blank to keep current password" : "Minimum 6 characters"}
              />
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
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
              disabled={!formData.name || !formData.email || (!editingParent && !formData.password)}
            >
              {editingParent ? 'Update Parent' : 'Create Parent Account'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Link Children Dialog */}
        <Dialog open={openLinkDialog} onClose={handleCloseLinkDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Link to Children</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Autocomplete
                multiple
                options={students}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.class})`}
                value={students.filter(s => selectedChildren.includes(s._id || s.id))}
                onChange={(e, newValue) => {
                  setSelectedChildren(newValue.map(v => v._id || v.id));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Children"
                    placeholder="Search students..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip 
                        key={key}
                        label={`${option.firstName} ${option.lastName}`} 
                        {...tagProps}
                        color="primary" 
                      />
                    );
                  })
                }
              />
              <Alert severity="info" sx={{ mt: 2 }}>
                Select the students that are children of this parent
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLinkDialog}>Cancel</Button>
            <Button onClick={handleLinkChildren} variant="contained">
              Save Links
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default Parents;
