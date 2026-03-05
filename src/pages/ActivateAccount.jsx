import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOpen,
  CheckCircle,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../config/api';

function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid activation link. No token provided.');
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/auth/validate-token/${token}`);
      
      if (response.data.valid) {
        setTokenValid(true);
        setTokenData(response.data);
        setError('');
      } else {
        setTokenValid(false);
        setError(response.data.message || 'Invalid or expired activation link.');
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setTokenValid(false);
      setError(
        err.response?.data?.message || 
        'Invalid or expired activation link. Please contact the administrator for a new invite.'
      );
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/(?=.*[a-z])/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/(?=.*\d)/.test(password)) {
      setError('Password must contain at least one number');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    try {
      setActivating(true);

      // Activate account with password
      const response = await api.post('/auth/activate-account', {
        token,
        password,
      });

      setSuccess(true);

      // Auto-login after 1 second
      setTimeout(async () => {
        try {
          // Login with the credentials
          await login(tokenData.email, password);
          
          // Redirect based on role
          const redirectPath = 
            tokenData.role === 'teacher' ? '/teacher/dashboard' :
            tokenData.role === 'parent' ? '/parent/dashboard' :
            '/login';
          
          navigate(redirectPath, { replace: true });
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          // If auto-login fails, redirect to login page
          navigate('/login', { 
            state: { 
              message: 'Account activated! Please log in with your credentials.' 
            } 
          });
        }
      }, 1500);

    } catch (err) {
      console.error('Activation error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to activate account. Please try again or contact support.'
      );
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: { xs: 2, sm: 3 },
        }}
      >
        <CircularProgress size={{ xs: 50, sm: 60 }} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (!tokenValid) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={6} sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'error.main',
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                margin: { xs: '0 auto 16px', sm: '0 auto 20px' },
              }}
            >
              <LockOpen sx={{ fontSize: { xs: 32, sm: 40 } }} />
            </Avatar>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Invalid Activation Link
            </Typography>
            <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {error}
            </Alert>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              This activation link may have expired or already been used.
              Please contact the school administrator for a new invitation.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              fullWidth
              sx={{ py: { xs: 1, sm: 1.5 } }}
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={6} sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'success.main',
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                margin: { xs: '0 auto 16px', sm: '0 auto 20px' },
              }}
            >
              <CheckCircle sx={{ fontSize: { xs: 32, sm: 40 } }} />
            </Avatar>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Account Activated!
            </Typography>
            <Alert severity="success" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Your account has been successfully activated. Redirecting to your dashboard...
            </Alert>
            <CircularProgress size={{ xs: 35, sm: 40 }} />
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                margin: { xs: '0 auto 16px', sm: '0 auto 20px' },
              }}
            >
              <Person sx={{ fontSize: { xs: 32, sm: 40 } }} />
            </Avatar>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}
            >
              Welcome{tokenData?.name ? `, ${tokenData.name}` : ''}!
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Activate your {tokenData?.role || 'account'}
            </Typography>
          </Box>

          <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

          {/* Account Info */}
          <Alert severity="info" sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              <strong>Email:</strong> {tokenData?.email}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              <strong>Role:</strong> {tokenData?.role?.charAt(0).toUpperCase() + tokenData?.role?.slice(1)}
            </Typography>
          </Alert>

          {/* Password Form */}
          <form onSubmit={handleActivate}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Set Your Password
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoFocus
              InputProps={{
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
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: { xs: '0.9rem', sm: '1rem' } 
                },
                '& .MuiInputLabel-root': { 
                  fontSize: { xs: '0.9rem', sm: '1rem' } 
                }
              }}
              helperText="At least 8 characters, including uppercase, lowercase, and number"
              FormHelperTextProps={{
                sx: { fontSize: { xs: '0.7rem', sm: '0.75rem' } }
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: { xs: '0.9rem', sm: '1rem' } 
                },
                '& .MuiInputLabel-root': { 
                  fontSize: { xs: '0.9rem', sm: '1rem' } 
                }
              }}
            />

            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={activating}
                sx={{
                  py: { xs: 1.2, sm: 1.5 },
                  fontSize: { xs: '0.95rem', sm: '1.1rem' },
                  fontWeight: 'bold',
                }}
              >
                {activating ? (
                  <>
                    <CircularProgress size={{ xs: 20, sm: 24 }} sx={{ mr: 1 }} />
                    Activating Account...
                  </>
                ) : (
                  'Activate Account'
                )}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          {/* Footer */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              🔒 Your password is encrypted and secure
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ActivateAccount;
