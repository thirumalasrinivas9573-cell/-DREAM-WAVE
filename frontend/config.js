// Central API configuration — used by all pages
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5001'
  : 'https://aa-dream-wave-backend.onrender.com';

const API_URL = API_BASE_URL + '/api';
