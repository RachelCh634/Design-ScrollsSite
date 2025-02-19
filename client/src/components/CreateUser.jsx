import React, { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  IconButton,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import EmailIcon from '@mui/icons-material/Email';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import { setUser } from '../redux/userSlice';
import { useDispatch } from 'react-redux';

const CreateUser = ({ open, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: '',
    displayName: '',
    phoneNumber: '',
    additionalPhone: '',
    email: '',
    city: '',
    isSeller: false,
    password: '',
    isAutoGeneratedPassword: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => {
      const newFormData = { ...prevData, [name]: value };
      if (name === "password") {
        newFormData.isAutoGeneratedPassword = event.nativeEvent.inputType === 'insertReplacementText';
      }
      return newFormData;
    });
  };

  // וולידציה של המייל
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // וולידציה של מספר טלפון (אורך מינימלי לדוגמה)
  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/; 
    return regex.test(phone);
  };

  // וולידציה של סיסמה
  const validatePassword = (password) => {
    const regex =  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleCreateUserSubmit = async (event) => {
    event.preventDefault();

    // וולידציה בצד הקליינט
    if (!validateEmail(formData.email)) {
      setSnackbar({ open: true, message: 'כתובת הדואר האלקטרוני לא תקינה', severity: 'error' });
      return;
    }

    if (!validatePhone(formData.phoneNumber)) {
      setSnackbar({ open: true, message: 'מספר הטלפון לא תקין', severity: 'error' });
      return;
    }

    if (!formData.isAutoGeneratedPassword && formData.password && !validatePassword(formData.password)) {
      setSnackbar({ open: true, message: 'הסיסמה לא עומדת בדרישות', severity: 'error' });
      return;
    }

    try {
      const response = await axios.post('https://scrolls-website.onrender.com/usersApi/addUser', formData, {
        withCredentials: true,
      });
      setSnackbar({ open: true, message: 'המשתמש נוצר בהצלחה!', severity: 'success' });
      dispatch(setUser(formData));
      onClose();
      navigate('/products'); 
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'שגיאה ביצירת המשתמש';
      if (errorMessage.includes("email")) {
        setSnackbar({ open: true, message: 'הדואר האלקטרוני לא תקין או כבר קיים במערכת', severity: 'error' });
      } else if (errorMessage.includes("phone")) {
        setSnackbar({ open: true, message: 'מספר הטלפון לא תקין או כבר קיים במערכת', severity: 'error' });
      } else if (errorMessage.includes("password")) {
        setSnackbar({ open: true, message: 'הסיסמה לא עומדת בדרישות', severity: 'error' });
      } else if (errorMessage.includes("name")) {
        setSnackbar({ open: true, message: 'שם המשתמש כבר קיים במערכת', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: `שגיאה: ${errorMessage}`, severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 2 }}>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            יצירת משתמש חדש
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleCreateUserSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="fullName"
                label="שם מלא"
                value={formData.fullName}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, fontSize: '20px' }} /> }}
              />
              <TextField
                name="displayName"
                label="שם תצוגה"
                value={formData.displayName}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{ startAdornment: <BadgeIcon sx={{ mr: 1, fontSize: '20px' }} /> }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="phoneNumber"
                label="מספר טלפון"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, fontSize: '20px' }} /> }}
              />
              <TextField
                name="additionalPhone"
                label="טלפון נוסף (אופציונלי)"
                type="tel"
                value={formData.additionalPhone}
                onChange={handleChange}
                fullWidth
                InputProps={{ startAdornment: <ContactPhoneIcon sx={{ mr: 1, fontSize: '20px' }} /> }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="email"
                label="דואר אלקטרוני"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, fontSize: '20px' }} /> }}
              />
              <TextField
                name="city"
                label="עיר"
                value={formData.city}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{ startAdornment: <LocationCityIcon sx={{ mr: 1, fontSize: '20px' }} /> }}
              />
            </Box>

            <TextField
              name="password"
              label="סיסמא"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="new-password"
              InputProps={{ startAdornment: <LockIcon sx={{ mr: 1, fontSize: "20px" }} /> }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'flex-start', p: 2 }}>
          <Button onClick={onClose} variant="outlined">ביטול</Button>
          <Button onClick={handleCreateUserSubmit} variant="contained" color="primary">צור משתמש</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateUser;