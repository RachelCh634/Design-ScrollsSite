import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Typography, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { deleteUser } from '../redux/userSlice';

export default function UserAccount() {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
      dispatch(deleteUser());
    }
  };

  return (
    <Box 
      sx={{ 
        width: '400px', 
        margin: 'auto', 
        textAlign: 'center', 
        padding: '20px', 
        boxShadow: 3, 
        borderRadius: 2, 
        backgroundColor: '#f9f9f9'
      }}
    >
      <Avatar 
        sx={{ 
          width: 60, 
          height: 60, 
          margin: '0 auto', 
          bgcolor: 'primary.main',
          fontSize: '2rem'
        }}
      >
        {user?.fullName ? user.fullName.charAt(0) : 'א'}
      </Avatar>
      <Typography variant="h6" sx={{ mt: 2, fontFamily: 'Rubik, sans-serif' }}>
        {user?.fullName || 'שם לא זמין'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {user?.email || 'אימייל לא זמין'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {user?.city || 'כתובת לא זמינה'}
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="contained" component={Link} to="/editUser" sx={{ width: '48%' }}>
          עריכת פרטים
        </Button>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleDelete} 
          sx={{ width: '48%' }}
        >
          מחיקת משתמש
        </Button>
      </Box>
    </Box>
  );
}