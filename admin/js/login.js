
const API_BASE_URL = 'http://localhost:5000/api';

const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');

// Remove any previous admin session when opening the login page.
sessionStorage.removeItem('adminToken');
sessionStorage.removeItem('adminUser');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginMessage.textContent = '';
  loginButton.disabled = true;
  loginButton.textContent = 'Signing in...';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }

    // Only company administrators can enter this panel.
    if (data.role !== 'admin') {
      throw new Error('You do not have permission to access the admin panel.');
    }

    if (!data.token) {
      throw new Error('Login token was not received.');
    }

    sessionStorage.setItem('adminToken', data.token);

    sessionStorage.setItem('adminUser', JSON.stringify({
      name: data.name,
      email: data.email,
      role: data.role
    }));

    window.location.href = 'dashboard.html';

  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Sign In';
  }
});
