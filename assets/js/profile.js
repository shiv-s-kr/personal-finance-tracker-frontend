const PROFILE_API = 'https://personal-finance-tracker-seven-gilt.vercel.app/api/v1/profile';
const userData = localStorage.getItem('user');
const user = JSON.parse(userData);
let currentUserId = user.id || 1;

async function loadProfile() {
  try {
    const response = await fetch(`${PROFILE_API}?user_id=${currentUserId}`);
    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      document.getElementById('view-name').textContent = data.name || 'N/A';
      document.getElementById('view-email').textContent = data.email || 'N/A';
      
      // Pre-fill form with current values
      document.getElementById('name').value = data.name || '';
      document.getElementById('email').value = data.email || '';
      document.getElementById('phone').value = data.phone || '';
    }
  } catch (error) {
    showMessage('Failed to load profile', 'error');
  }
}

async function updateProfile() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (password) updateData.password = password;
  
  if (Object.keys(updateData).length === 0) {
    showMessage('Please fill at least one field', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${PROFILE_API}?user_id=${currentUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage(`${result.updated_fields?.length || 1} field(s) updated!`, 'success');
      loadProfile();
      document.getElementById('password').value = '';
    } else {
      showMessage(result.error, 'error');
    }
  } catch (error) {
    showMessage('Network error. Try again.', 'error');
  }
}

// deleteAccount function 
async function deleteAccount() {
  if (!confirm('⚠️ Are you SURE? This deletes ALL your data permanently!')) {
    return;
  }
  
  if (!prompt('Type "DELETE" to confirm:')) {
    return;
  }
  
  try {
    const response = await fetch(`${PROFILE_API}?user_id=${currentUserId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage(result.message, 'warning');
      setTimeout(() => {
        alert('Account deleted. Redirecting to login...');
        window.location.href = 'login.html';
      }, 2000);
    } else {
      showMessage(result.error, 'error');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showMessage('Delete failed. Try again.', 'error');
  }
}

function showMessage(message, type = 'success') {
  const msgEl = document.getElementById('update-msg');
  msgEl.textContent = message;
  msgEl.className = type;
  msgEl.style.display = 'block';
  setTimeout(() => {
    msgEl.style.display = 'none';
  }, 5000);
}


document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  
  // Expose functions to global scope (for onclick handlers)
  window.updateProfile = updateProfile;
  window.deleteAccount = deleteAccount;
});
