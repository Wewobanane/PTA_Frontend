import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Avatar, Divider, Alert
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminLayout from '../../components/layout/AdminLayout';
import axios from 'axios';

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Administrator',
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
    <AdminLayout>
      <Box sx={{ pt: 3, pr: 3, pb: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            ⚙️ Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AccountCircleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Profile Information
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mr: 3 }}>
                    <Typography variant="h4">
                      {profileData?.name?.charAt(0) || user?.name?.charAt(0) || 'A'}
                    </Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{profileData?.name || user?.name || 'Administrator'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profileData?.email || user?.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Role: {user?.role?.toUpperCase() || 'ADMIN'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
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
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleProfileUpdate}
                        disabled={profileLoading}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={logout}
                      >
                        Logout
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Account Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Account Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Account Type
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Administrator
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {user?.id || user?._id || 'admin'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Access Level
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="error">
                      Full System Access
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Session
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      Active
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}
