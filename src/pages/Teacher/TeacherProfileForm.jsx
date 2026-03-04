import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Alert,
  Chip,
  Typography,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { authAPI } from '../../config/api';

function TeacherProfileForm({ initialSubject = '', initialPhone = '', onProfileUpdated }) {
  const [subjectInput, setSubjectInput] = useState(initialSubject);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const payload = {
        phone,
        subject: subjectInput,
      };

      const response = await authAPI.updateProfile(payload);

      if (response.status === 200 && response.data?.data) {
        setSuccess('Profile updated successfully');
        if (onProfileUpdated) {
          onProfileUpdated(response.data.data);
        }
      } else {
        setError(response.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 4000);
    }
  };

  const subjectsPreview = subjectInput
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <Card sx={{ mb: 4, borderLeft: '4px solid #1976d2' }}>
      <CardHeader
        title="Complete Your Teaching Profile"
        subheader="Add your phone number and the subject(s) you teach so the admin can see your full details."
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
      />
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <TextField
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Subject(s) You Teach"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            fullWidth
            required
            helperText="Example: Mathematics, English, Science"
          />

          {subjectsPreview.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {subjectsPreview.map((subj, idx) => (
                <Chip key={idx} label={subj} color="primary" variant="outlined" />
              ))}
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            Once you save, your subject(s) and phone number will appear for the admin under your teacher
            profile, and they can then assign you to the appropriate classes and classrooms.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saving || !phone || !subjectInput}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TeacherProfileForm;

