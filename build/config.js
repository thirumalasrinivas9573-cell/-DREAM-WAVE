// Central API configuration — used by all pages
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://YOUR_DEPLOYMENT_URL_HERE';  // replace after deploying

const API_URL = API_BASE_URL + '/api';
