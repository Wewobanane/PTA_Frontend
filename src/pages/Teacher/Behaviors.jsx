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
  IconButton,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  ThumbUp,
  ThumbDown,
  Delete as DeleteIcon,
  Send as SendIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { teacherAPI, behaviorAPI } from '../../config/api';
import { useApi } from '../../hooks/useApi';

function Behaviors() {
  const { request, loading, error } = useApi();
  const [openDialog, setOpenDialog] = useState(false);
  const [behaviors, setBehaviors] = useState([]);
  const [classroomStudents, setClassroomStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [editingBehavior, setEditingBehavior] = useState(null);

  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    type: 'positive',
    category: '',
    title: '',
    description: '',
  });

  const categories = {
    positive: ['participation', 'leadership', 'cooperation', 'respect'],
    negative: ['disruption', 'lateness', 'misconduct', 'homework', 'conduct'],
  };

  // Fetch classrooms and behaviors on mount
  useEffect(() => {
    const fetchData = async () => {
      const classroomsResult = await request(teacherAPI.getClassrooms);
      if (classroomsResult.success && classroomsResult.data?.data) {
        setClasses(classroomsResult.data.data.map(c => ({
          id: c.academicYearId,
          name: `${c.yearName} · ${c.termLabel} · ${c.classLevel}`,
        })));
      } else {
        setClasses([]);
      }

      const behaviorsResult = await request(behaviorAPI.getAllBehaviors);
      if (behaviorsResult.success && behaviorsResult.data?.data) {
        setBehaviors(behaviorsResult.data.data.map(b => ({
          id: b._id,
          studentId: b.student?._id || b.student,
          student: `${b.student?.firstName || ''} ${b.student?.lastName || ''}`.trim(),
          class: b.student?.class || 'N/A',
          type: b.type,
          category: b.category,
          comment: b.description,
          title: b.title,
          date: b.date,
          parentNotified: b.parentNotified,
        })));
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
        })));
      } else {
        setClassroomStudents([]);
      }
    };
    fetchStudents();
  }, [formData.classId]);

  const handleOpenDialog = () => {
    setEditingBehavior(null);
    setOpenDialog(true);
  };

  const handleEditBehavior = (behavior) => {
    setFormData({
      studentId: behavior.studentId || '',
      classId: '', // user re-selects classroom; student dropdown then loads
      type: behavior.type,
      category: behavior.category,
      title: behavior.title,
      description: behavior.comment,
    });
    setEditingBehavior(behavior);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBehavior(null);
    setFormData({
      studentId: '',
      classId: '',
      type: 'positive',
      category: '',
      title: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    const behaviorData = {
      student: formData.studentId,
      type: formData.type,
      category: formData.category,
      title: formData.title || `${formData.type} behavior`,
      description: formData.description,
    };

    if (editingBehavior) {
      // Update existing behavior
      const result = await request(behaviorAPI.updateBehavior, editingBehavior.id, behaviorData);
      
      if (result.success && result.data?.data) {
        const updatedBehavior = {
          id: result.data.data._id,
          student: `${result.data.data.student?.firstName || ''} ${result.data.data.student?.lastName || ''}`.trim(),
          class: result.data.data.student?.class || 'N/A',
          type: result.data.data.type,
          category: result.data.data.category,
          comment: result.data.data.description,
          title: result.data.data.title,
          date: result.data.data.date,
          parentNotified: result.data.data.parentNotified,
        };
        setBehaviors(behaviors.map(b => b.id === editingBehavior.id ? updatedBehavior : b));
        handleCloseDialog();
      }
    } else {
      // Create new behavior
      const result = await request(behaviorAPI.createBehavior, behaviorData);
      
      if (result.success && result.data?.data) {
        const newBehavior = {
          id: result.data.data._id,
          student: `${result.data.data.student?.firstName || ''} ${result.data.data.student?.lastName || ''}`.trim(),
          class: result.data.data.student?.class || 'N/A',
          type: result.data.data.type,
          category: result.data.data.category,
          comment: result.data.data.description,
          title: result.data.data.title,
          date: result.data.data.date,
          parentNotified: result.data.data.parentNotified,
        };
        setBehaviors([newBehavior, ...behaviors]);
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this behavior log?')) {
      const result = await request(behaviorAPI.deleteBehavior, id);
      if (result.success) {
        setBehaviors(behaviors.filter((b) => b.id !== id));
      }
    }
  };

  return (
    <TeacherLayout>
      <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              📝 Behavior Tracking
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Record and track student behavior
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            size="large"
          >
            Add Behavior
          </Button>
        </Box>

        {classes.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              No Classes Assigned
            </Typography>
            <Typography variant="body2">
              You don't have any classes assigned to you yet. Please contact the administrator to assign classes before you can record behaviors.
            </Typography>
          </Alert>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                🧠 Teacher Mental Model: "I focus on my class. I record facts. Parents get informed automatically."
              </Typography>
              <Typography variant="body2">
                <strong>How It Works:</strong><br />
                1. Select student and behavior type (Positive 🟢 / Negative 🔴)<br />
                2. Choose category and add comment<br />
                3. Save - <strong>Parent is notified instantly</strong><br />
                4. Behavior saved to student record (cannot be deleted for audit trail)
              </Typography>
            </Alert>

            <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Class</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Comment</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Parent Notified</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {behaviors.map((behavior) => (
                <TableRow key={behavior.id}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {behavior.student}
                    </Typography>
                  </TableCell>
                  <TableCell>{behavior.class}</TableCell>
                  <TableCell>
                    <Chip
                      icon={behavior.type === 'positive' ? <ThumbUp /> : <ThumbDown />}
                      label={behavior.type}
                      color={behavior.type === 'positive' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={behavior.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{behavior.comment}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(behavior.date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {behavior.parentNotified ? (
                      <Chip label="Sent" color="success" size="small" icon={<SendIcon />} />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditBehavior(behavior)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(behavior.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {behaviors.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No behavior records yet. Click "Add Behavior" to record student behavior.
          </Alert>
        )}
        </>
        )}

        {/* Add/Edit Behavior Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingBehavior ? 'Edit Behavior Log' : 'Add Behavior Log'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value, studentId: '' })}
                  label="Select Class"
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  label="Select Student"
                  disabled={!formData.classId}
                >
                  {classroomStudents.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Behavior Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value, category: '' })
                  }
                  label="Behavior Type"
                >
                  <MenuItem value="positive">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ThumbUp fontSize="small" color="success" />
                      Positive
                    </Box>
                  </MenuItem>
                  <MenuItem value="negative">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ThumbDown fontSize="small" color="error" />
                      Negative
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  {categories[formData.type].map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief title for the behavior"
                fullWidth
              />

              <TextField
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the behavior in detail..."
                fullWidth
              />

              <Alert severity="success">
                <Typography variant="body2">
                  <strong>📱 Parent will be notified instantly:</strong><br />
                  "New behavior record added for {formData.studentId ? 'student name' : 'your child'}."<br />
                  <em>You never select parents manually - system handles it automatically.</em>
                </Typography>
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.studentId ||
                !formData.classId ||
                !formData.category ||
                !formData.description
              }
            >
              {editingBehavior ? 'Update Behavior' : 'Save & Notify Parent'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </TeacherLayout>
  );
}

export default Behaviors;
