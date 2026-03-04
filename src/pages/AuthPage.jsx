import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  School,
  People,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const hasRedirected = useRef(false);

  // Check for activation success message
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  // Login State
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'parent',
  });

  const roles = [
    { value: 'admin', label: 'Admin', icon: <AdminPanelSettings />, color: 'primary' },
    { value: 'teacher', label: 'Teacher', icon: <School />, color: 'success' },
    { value: 'parent', label: 'Parent', icon: <People />, color: 'secondary' },
  ];

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLoginRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setLoginData({ ...loginData, role: newRole });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginData);

    if (result.success) {
      setSuccess('Login successful! Redirecting...');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
        m: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
              }}
            >
              <School sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              PTA Management System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connecting Parents, Teachers, and Administrators
            </Typography>
          </Box>

          {/* Error/Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin}>
            {/* Role Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Select Your Role
              </Typography>
              <ToggleButtonGroup
                value={loginData.role}
                exclusive
                onChange={handleLoginRoleChange}
                fullWidth
                color="primary"
              >
                {roles.map((role) => (
                  <ToggleButton key={role.value} value={role.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {role.icon}
                      <Typography variant="body2">{role.label}</Typography>
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={loginData.password}
              onChange={handleLoginChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : `Login as ${roles.find(r => r.value === loginData.role)?.label}`}
            </Button>
          </Box>

          {/* Info Message */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}
          >
            📧 New users must be invited by an administrator. Check your email for an activation link.
          </Typography>

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            © 2026 PTA Management System. All rights reserved.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthPage;
