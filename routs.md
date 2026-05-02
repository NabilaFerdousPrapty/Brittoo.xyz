router.post('/register', register);
router.post('/verify-otp', verifyOtpLimiter, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginLimiter, login);
router.post("/verify-user", verifyToken, uploadMiddleware, verifyUser);
router.get('/get-current-user', verifyToken, getCurrentUser);
router.post('/forgot-password', generatePasswordResetToken);
router.post('/reset-password', resetPasswordWithToken);
