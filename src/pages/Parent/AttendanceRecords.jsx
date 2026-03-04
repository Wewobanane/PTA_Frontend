import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
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
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  CalendarToday,
} from '@mui/icons-material';
import ParentLayout from '../../components/layout/ParentLayout';
import { parentAPI } from '../../config/api';

function AttendanceRecords() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myChildren, setMyChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendance(selectedChild);
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

  const fetchAttendance = async (childId) => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildAttendance(childId);
      setAttendance(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    present: attendance.filter((a) => a.status === 'present').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    total: attendance.length,
    rate: attendance.length > 0
      ? ((attendance.filter((a) => a.status === 'present').length / attendance.length) * 100).toFixed(1)
      : 0,
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const selectedChildData = myChildren.find((c) => c._id === selectedChild);

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
              Attendance Records
            </Typography>
            <Typography variant="body1" color="text.secondary">
              📅 View attendance history
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

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {stats.rate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendance Rate
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                borderLeft: '4px solid',
                borderColor: 'success.main',
                bgcolor: 'success.50',
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {stats.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Present
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                borderLeft: '4px solid',
                borderColor: 'error.main',
                bgcolor: 'error.50',
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {stats.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Absent
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                borderLeft: '4px solid',
                borderColor: 'info.main',
                bgcolor: 'info.50',
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Days
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>📋 Read-Only View:</strong> Attendance is marked by teachers daily. Contact the school office for any corrections.
          </Typography>
        </Alert>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : attendance.length === 0 ? (
          <Alert severity="info">No attendance records available yet.</Alert>
        ) : (
          <Card elevation={2}>
            <CardHeader
              title={`Attendance History (${attendance.length} days)`}
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              avatar={<CalendarToday />}
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell align="center"><strong>Status</strong></TableCell>
                      <TableCell><strong>Subject</strong></TableCell>
                      <TableCell><strong>Teacher</strong></TableCell>
                      <TableCell><strong>Notes</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow
                        key={record._id}
                        sx={{
                          bgcolor: record.status === 'present' ? 'success.50' : 'error.50',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDate(record.date)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={
                              record.status === 'present' ? (
                                <CheckCircle />
                              ) : (
                                <Cancel />
                              )
                            }
                            label={record.status.toUpperCase()}
                            color={record.status === 'present' ? 'success' : 'error'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                          {record.teacher?.subject || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.teacher?.name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {record.remarks ? (
                            <Typography variant="body2" color="text.secondary">
                              {record.remarks}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No notes
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </ParentLayout>
  );
}

export default AttendanceRecords;
