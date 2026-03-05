import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Avatar, Divider, Alert, Chip
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import ParentLayout from '../../components/layout/ParentLayout';
import axios from 'axios';

export default function ParentSettings() {
  const { user, logout } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [children, setChildren] = useState([]);
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Parent',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const me = response.data?.user || response.data;

        setProfileData((prev) => ({
          ...prev,
          name: me?.name ?? prev.name,
          email: me?.email ?? prev.email,
          phone: me?.phone ?? prev.phone,
        }));

        // Fetch children if available
        if (me?.children && me.children.length > 0) {
          const childrenData = await Promise.all(
            me.children.map(async (childId) => {
              try {
                const childRes = await axios.get(`${API_URL}/students/${childId}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                return childRes.data;
              } catch (err) {
                console.error('Failed to fetch child:', err);
                return null;
              }
            })
          );
          setChildren(childrenData.filter(c => c !== null));
        }
      } catch (error) {
        setErrorMessage('Failed to load profile. Please refresh.');
      } finally {
        setProfileLoading(false);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
      const response = await axios.put(`${API_URL}/auth/me`, {
        name: profileData.name,
        phone: profileData.phone
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 200) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <ParentLayout>
      <Box sx={{ pt: { xs: 1, sm: 2, md: 3 }, pr: { xs: 1, sm: 2, md: 3 }, pb: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2.125rem' }
            }}
          >
            ⚙️ Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' } }}>
            Manage your account settings and preferences
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: { xs: 1.5, sm: 2, md: 3 }, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: { xs: 1.5, sm: 2, md: 3 }, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          {/* Profile Section */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2, lg: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2, md: 3 } }}>
                  <AccountCircleIcon color="primary" sx={{ mr: { xs: 0.75, sm: 1 }, fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' } }}>
                    Profile Information
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'center', sm: 'center' },
                  textAlign: { xs: 'center', sm: 'left' },
                  mb: { xs: 1.5, sm: 2, md: 3 } 
                }}>
                  <Avatar sx={{ 
                    width: { xs: 56, sm: 64, md: 72, lg: 80 }, 
                    height: { xs: 56, sm: 64, md: 72, lg: 80 }, 
                    bgcolor: 'primary.main', 
                    mr: { xs: 0, sm: 2, md: 3 },
                    mb: { xs: 1, sm: 0 }
                  }}>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.125rem' } }}>
                      {profileData?.name?.charAt(0) || user?.name?.charAt(0) || 'P'}
                    </Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' } }}>
                      {profileData?.name || user?.name || 'Parent'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                      {profileData?.email || user?.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', sm: '0.7rem', md: '0.75rem' } }}>
                      Role: {user?.role?.toUpperCase() || 'PARENT'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: { xs: 1.5, sm: 2, md: 3 } }} />

                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={profileLoading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email Address"
                      fullWidth
                      value={profileData.email}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Phone Number"
                      fullWidth
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={profileLoading}
                      helperText={profileLoading ? 'Loading...' : undefined}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1.5, sm: 2 } 
                    }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }} />}
                        onClick={handleProfileUpdate}
                        disabled={profileLoading}
                        fullWidth={window.innerWidth < 600}
                        sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' } }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }} />}
                        onClick={logout}
                        fullWidth={window.innerWidth < 600}
                        sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' } }}
                      >
                        Logout
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Children Section */}
            {children.length > 0 && (
              <Card sx={{ mt: { xs: 2, md: 3 } }}>
                <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2, lg: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2, md: 3 } }}>
                    <ChildCareIcon color="primary" sx={{ mr: { xs: 0.75, sm: 1 }, fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' } }}>
                      My Children
                    </Typography>
                  </Box>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    {children.map((child) => (
                      <Grid item xs={12} sm={6} key={child._id || child.id}>
                        <Card variant="outlined">
                          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' } }}>
                              {child.firstName} {child.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' } }}>
                              Student ID: {child.studentId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' } }}>
                              Class: {child.class} {child.section}
                            </Typography>
                            <Box sx={{ mt: { xs: 0.75, sm: 1 } }}>
                              <Chip 
                                label={child.gender} 
                                size="small" 
                                color={child.gender === 'male' ? 'info' : 'secondary'}
                                sx={{ fontSize: { xs: '0.6875rem', sm: '0.75rem' }, height: { xs: '20px', sm: '24px' } }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Account Info */}
            <Card>
              <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2, lg: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' }
                  }}
                >
                  Account Information
                </Typography>
                <Divider sx={{ my: { xs: 1.5, md: 2 } }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', sm: '0.7rem', md: '0.75rem' } }}>
                      Account Type
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' } }}>
                      Parent
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', sm: '0.7rem', md: '0.75rem' } }}>
                      User ID
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' }, wordBreak: 'break-all' }}>
                      {user?.id || user?._id || 'parent'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', sm: '0.7rem', md: '0.75rem' } }}>
                      Linked Children
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' } }}>
                      {children.length} {children.length === 1 ? 'Child' : 'Children'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', sm: '0.7rem', md: '0.75rem' } }}>
                      Session
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' } }}>
                      Active
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ParentLayout>
  );
}
