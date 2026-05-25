import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://localhost:5000/'; // 🔧 Change to your backend URL

class ApiClient {
  constructor() {
    this.baseURL = BASE_URL;
  }

  async getToken() {
    return await AsyncStorage.getItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    if (options.body && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    } else if (options.body instanceof FormData) {
      // Let fetch set the Content-Type for multipart
      delete config.headers['Content-Type'];
      config.body = options.body;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw { status: response.status, message: data.message || 'Something went wrong', data };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      throw { status: 0, message: 'Network error. Please check your connection.', data: null };
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'POST', body, ...options });
  }
}

export default new ApiClient();
