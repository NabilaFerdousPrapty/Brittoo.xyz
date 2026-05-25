import client from './client';

export const authApi = {
  register: (data) =>
    client.post('/api/auth/register', data),

  verifyOTP: (email, otp) =>
    client.post('/api/auth/verify-otp', { email, otp }),

  resendOTP: (email) =>
    client.post('/api/auth/resend-otp', { email }),

  login: (email, password) =>
    client.post('/api/auth/login', { email, password }),

  getCurrentUser: () =>
    client.get('/api/auth/get-current-user'),

  forgotPassword: (email) =>
    client.post('/api/auth/forgot-password', { email }),

  validateResetToken: (token) =>
    client.get(`/api/auth/validate-reset-token/${token}`),

  resetPassword: (token, newPassword) =>
    client.post('/api/auth/reset-password', { token, newPassword }),

  verifyUser: (email, idCardUri, selfieUri) => {
    const formData = new FormData();
    formData.append('email', email);

    const idCardName = idCardUri.split('/').pop();
    const selfieeName = selfieUri.split('/').pop();
    const getExt = (uri) => uri.split('.').pop();

    formData.append('idCard', {
      uri: idCardUri,
      name: idCardName,
      type: `image/${getExt(idCardUri)}`,
    });
    formData.append('selfie', {
      uri: selfieUri,
      name: selfieeName,
      type: `image/${getExt(selfieUri)}`,
    });

    return client.post('/api/auth/verify-user', formData);
  },
};
