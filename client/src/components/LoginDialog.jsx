import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    Box,
    Divider,
    Typography,
    Link,
    useTheme,
    useMediaQuery,
    CircularProgress,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GoogleAuth from './GoogleAuth';
import CreateUser from './CreateUser';
import GoogleLogo from '../assets/google-logo.png';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';

const LoginDialog = ({ open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showGoogleAuth, setShowGoogleAuth] = useState(false);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/usersApi/loginUser', {
                username,
                password,
            });
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            dispatch(setUser(response.data.user));
            const successMessage = document.createElement('div');
            successMessage.innerHTML = '✓ התחברת בהצלחה';
            successMessage.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 16px;
                border-radius: 8px;
                z-index: 9999;
            `;
            document.body.appendChild(successMessage);

            setTimeout(() => {
                successMessage.remove();
                handleClose();
                navigate('/products');
            }, 1500);

        } catch (error) {
            console.log('Login Error:', error.response);
            if (error.response?.status === 401) {
                if (error.response?.data?.includes('User not found')) {
                    setShowCreateUser(true);
                    onClose();
                } else {
                    setError('שם משתמש או סיסמה שגויים');
                }
            } else {
                setError('שם משתמש או סיסמה שגויים');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setUsername('');
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                component: motion.div,
                initial: { y: -50, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                transition: { duration: 0.3 },
                sx: {
                    borderRadius: '16px',
                    overflow: 'hidden',
                    width: isMobile ? '95%' : '1000px',
                    minHeight: '500px',
                    bgcolor: 'background.paper',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    position: 'relative'
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', fontFamily: 'Heebo, sans-serif' }}>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        color: 'rgba(90, 59, 65, 1)',
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography
                    sx={{
                        background: 'rgba(230, 219, 201, 1)',
                        borderRadius: '39px',
                        color: 'rgba(0, 0, 0, 1)',
                        fontFamily: 'Heebo, sans-serif',
                        fontWeight: 'bold',
                        padding: '5px 170px',
                        textAlign: 'center',
                        width: 'fit-content',
                        margin: '0 auto',
                        marginTop: '10%',
                        marginBottom: '50px',
                    }}
                >
                    התחברות
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        p: 2,
                        alignItems: 'center',
                    }}
                >
                    <div style={{ display: 'flex', gap: '20px', width: '80%', fontFamily: 'Heebo, sans-serif', alignItems: 'center', justifyContent: 'center' }}>
                        <input
                            type="password"
                            placeholder="סיסמא"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                flex: 1,
                                padding: '6px',
                                borderRadius: '50px',
                                border: 'none',
                                background: '#47515A',
                                color: 'white',
                                fontSize: '0.9rem',
                                textAlign: 'right',
                                outline: 'none',
                                paddingRight: '10px',
                                fontFamily: 'Heebo, sans-serif',
                                height: '20px',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="שם תצוגה / שם מלא"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                flex: 1,
                                padding: '6px',
                                borderRadius: '50px',
                                border: 'none',
                                background: '#47515A',
                                color: 'white',
                                fontSize: '0.9rem',
                                textAlign: 'right',
                                outline: 'none',
                                paddingRight: '10px',
                                fontFamily: 'Heebo, sans-serif',
                                height: '20px',
                                textTransform: 'none'
                            }}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        sx={{
                            backgroundColor: 'rgba(90, 59, 65, 1)',
                            color: 'white',
                            padding: '0 10px',
                            borderRadius: '50px',
                            '&:hover': {
                                backgroundColor: 'rgba(90, 59, 65, 1)',
                            },
                            fontFamily: 'Heebo, sans-serif',
                            fontSize: '1.1rem',
                            height: '30px',
                            width: '80%',
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            'התחברות'
                        )}
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            backgroundColor: 'rgba(71, 81, 90, 1)',
                            marginTop: '20px',
                            color: 'white',
                            borderRadius: '50px',
                            padding: '0 10px',
                            fontFamily: 'Heebo, sans-serif',
                            fontSize: '1rem',
                            '&:hover': {
                                backgroundColor: 'rgba(71, 81, 90, 1)',
                            },
                            height: '30px',
                            fontFamily: 'Heebo, sans-serif',
                            width: '60%',
                            textTransform: 'none',
                            fontWeight: 200
                        }}
                        startIcon={
                            <img
                                src={GoogleLogo}
                                alt="Google logo"
                                style={{ width: '32px', height: '25px' }}
                            />
                        }
                        onClick={() => setShowGoogleAuth(true)}
                    >
                        Google התחבר עם
                    </Button>
                    <Typography variant="body2" sx={{ mt: 1, textAlign: 'right', paddingRight: 1, fontFamily: 'Heebo, sans-serif', fontSize: '1rem', marginTop: '10%' }}>
                        <span> ?</span>
                        אין לך חשבון
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowCreateUser(true)}
                        sx={{
                            backgroundColor: '#5A3B41',
                            borderRadius: '20px',
                            fontFamily: 'Heebo, sans-serif',
                            height: '25px',
                            minHeight: '30px',
                            fontWeight: 200,
                            width: '40%',
                        }}
                    >
                        הירשם עכשיו
                    </Button>
                </Box>
            </DialogContent>


            {showGoogleAuth && (
                <GoogleAuth
                    onSuccess={() => {
                        setShowGoogleAuth(false);
                        handleClose();
                    }}
                />
            )}

            {showCreateUser && (
                <CreateUser
                    open={showCreateUser}
                    onClose={() => setShowCreateUser(false)}
                />
            )}
        </Dialog>
    );
};

export default LoginDialog;
