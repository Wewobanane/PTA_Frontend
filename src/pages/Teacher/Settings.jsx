import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Avatar, Divider, Alert, Chip
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ClassIcon from '@mui/icons-material/Class';
import BookIcon from '@mui/icons-material/Book';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import TeacherLayout from '../../components/layout/TeacherLayout';
import axios from 'axios';

export default function TeacherSettings() {
  const { user, logout } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Teacher',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: user?.subject || '',
    classesTeaching: user?.classesTeaching || []
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

        const me = response.data?.data || response.data?.user || response.data;

        setProfileData((prev) => ({
          ...prev,
          name: me?.name ?? prev.name,
          email: me?.email ?? prev.email,
          phone: me?.phone ?? prev.phone,
          subject: me?.subject ?? prev.subject,
          classesTeaching: me?.classesTeaching ?? prev.classesTeaching
        }));
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
      const response = await axios.put(`${API_URL}/auth/updateprofile`, {
        name: profileData.name,
        phone: profileData.phone,
        subject: profileData.subject
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
    <TeacherLayout>
      <Box sx={{ pt: { xs: 1.5, sm: 2, md: 3 }, pr: { xs: 1.5, sm: 2, md: 3 }, pb: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
            }}
          >
            ⚙️ Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Manage your account settings and preferences
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Profile Section */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
                  <AccountCircleIcon color="primary" sx={{ mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                    Profile Information
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'center', sm: 'center' },
                  textAlign: { xs: 'center', sm: 'left' },
                  mb: { xs: 2, md: 3 } 
                }}>
                  <Avatar sx={{ 
                    width: { xs: 64, sm: 72, md: 80 }, 
                    height: { xs: 64, sm: 72, md: 80 }, 
                    bgcolor: 'primary.main', 
                    mr: { xs: 0, sm: 3 },
                    mb: { xs: 1.5, sm: 0 }
                  }}>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                      {profileData?.name?.charAt(0) || user?.name?.charAt(0) || 'T'}
                    </Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                      {profileData?.name || user?.name || 'Teacher'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {profileData?.email || user?.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Role: {user?.role?.toUpperCase() || 'TEACHER'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: { xs: 2, md: 3 } }} />

                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={profileLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Email Address"
                      fullWidth
                      value={profileData.email}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Phone Number"
                      fullWidth
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={profileLoading}
                      helperText={profileLoading ? 'Loading...' : undefined}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
              label="Subject(s) You Teach"
                      fullWidth
                      value={profileData.subject}
              onChange={(e) => setProfileData({ ...profileData, subject: e.target.value })}
              disabled={profileLoading}
              helperText={profileLoading ? 'Loading...' : 'Example: Mathematics, English, Science'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1.5, sm: 2 } 
                    }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                        onClick={handleProfileUpdate}
                        disabled={profileLoading}
                        fullWidth={window.innerWidth < 600}
                        sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                        onClick={logout}
                        fullWidth={window.innerWidth < 600}
                        sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
                      >
                        Logout
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Classes Section */}
            {profileData.classesTeaching && profileData.classesTeaching.length > 0 && (
              <Card sx={{ mt: { xs: 2, md: 3 } }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
                    <ClassIcon color="primary" sx={{ mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                      My Classes
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 }, flexWrap: 'wrap' }}>
                    {profileData.classesTeaching.map((className, index) => (
                      <Chip
                        key={index}
                        label={className}
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' } }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Account Info */}
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                  }}
                >
                  Account Information
                </Typography>
                <Divider sx={{ my: { xs: 1.5, md: 2 } }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Account Type
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Teacher
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      User ID
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, wordBreak: 'break-all' }}>
                      {user?.id || user?._id || 'teacher'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Subject
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {profileData.subject || 'Not Assigned'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Classes Teaching
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {profileData.classesTeaching?.length || 0} {profileData.classesTeaching?.length === 1 ? 'Class' : 'Classes'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Session
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Active
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </TeacherLayout>
  );
}
