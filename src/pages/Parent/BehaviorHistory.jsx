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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Star,
  Warning,
  FilterList,
} from '@mui/icons-material';
import ParentLayout from '../../components/layout/ParentLayout';
import { parentAPI } from '../../config/api';

function BehaviorHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myChildren, setMyChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [behaviors, setBehaviors] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchBehaviors(selectedChild);
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

  const fetchBehaviors = async (childId) => {
    try {
      setLoading(true);
      const response = await parentAPI.getChildBehavior(childId);
      setBehaviors(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching behaviors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBehaviors = behaviors.filter((behavior) => {
    if (filter === 'all') return true;
    return behavior.type === filter;
  });

  const stats = {
    positive: behaviors.filter((b) => b.type === 'positive').length,
    negative: behaviors.filter((b) => b.type === 'negative').length,
    total: behaviors.length,
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
              Behavior History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              🟢🔴 View positive and negative behavior records
            </Typography>
          </Box>
        </Box>

        {/* Child Selector */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
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
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={filter}
                    label="Filter"
                    onChange={(e) => setFilter(e.target.value)}
                    startAdornment={<FilterList sx={{ mr: 1 }} />}
                  >
                    <MenuItem value="all">All Behaviors</MenuItem>
                    <MenuItem value="positive">🟢 Positive Only</MenuItem>
                    <MenuItem value="negative">🔴 Negative Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
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
                🟢 {stats.positive}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Positive Behaviors
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
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
                🔴 {stats.negative}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Negative Behaviors
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
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
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Records
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>📋 Read-Only View:</strong> You can view but not edit behavior records. Contact the teacher if you have questions.
          </Typography>
        </Alert>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : filteredBehaviors.length === 0 ? (
          <Alert severity="info">
            {filter === 'all'
              ? 'No behavior records available yet.'
              : `No ${filter} behavior records found.`}
          </Alert>
        ) : (
          <Card elevation={2}>
            <CardHeader
              title={`Behavior Records (${filteredBehaviors.length})`}
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent>
              <List sx={{ p: 0 }}>
                {filteredBehaviors.map((behavior, index) => (
                  <React.Fragment key={behavior._id}>
                    <ListItem
                      sx={{
                        bgcolor: behavior.type === 'positive' ? 'success.50' : 'error.50',
                        borderRadius: 1,
                        mb: 1,
                        p: 2,
                      }}
                    >
                      <ListItemIcon>
                        {behavior.type === 'positive' ? (
                          <Star sx={{ color: 'success.main', fontSize: 40 }} />
                        ) : (
                          <Warning sx={{ color: 'error.main', fontSize: 40 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {behavior.type === 'positive' ? '🟢' : '🔴'} {behavior.category}
                            </Typography>
                            <Chip
                              label={behavior.type}
                              color={behavior.type === 'positive' ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body1" sx={{ mb: 1, mt: 1 }}>
                              {behavior.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              📅 {formatDate(behavior.date)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              👨‍🏫 Teacher: {behavior.teacher?.name || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              📚 Subject: {behavior.subject || behavior.teacher?.subject || 'N/A'}
                            </Typography>
                            {behavior.notes && (
                              <Alert severity="info" sx={{ mt: 1 }}>
                                <Typography variant="caption">
                                  <strong>Teacher's Note:</strong> {behavior.notes}
                                </Typography>
                              </Alert>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredBehaviors.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
    </ParentLayout>
  );
}

export default BehaviorHistory;
