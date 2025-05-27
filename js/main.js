document.addEventListener('DOMContentLoaded', () => {
  ui.init();
  setupEventListeners();
  checkSavedToken();
});
function setupEventListeners() {
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
  }
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  const refreshButton = document.getElementById('refresh-button');
  if (refreshButton) {
    refreshButton.addEventListener('click', handleRefresh);
  }
  const tokenInput = document.getElementById('token-input');
  if (tokenInput) {
    tokenInput.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
        handleLogin();
      }
    });
    tokenInput.addEventListener('input', () => {
      utils.clearError('token-error');
    });
  }
}
async function handleLogin() {
  const tokenInput = document.getElementById('token-input');
  const token = tokenInput.value.trim();
  if (!token) {
    utils.showError('token-error', 'Lütfen Discord bot tokeninizi girin');
    return;
  }
  
  utils.toggleLoading(true, 'Token doğrulanıyor...');
  
  try {
    const isValid = await api.testToken(token);
    
    if (!isValid) {
      utils.toggleLoading(false);
      utils.showError('token-error', 'Geçersiz token. Lütfen bot tokeninizi kontrol edip tekrar deneyin.');
      return;
    }
    api.setToken(token);
    localStorage.setItem('discord_bot_token', token);
    const botData = await api.fetchAllBotData();
    ui.renderDashboard(botData);
    utils.showSection('dashboard-section');
  } catch (error) {
    console.error('Giriş hatası:', error);
    utils.showError('token-error', `Hata: ${error.message || 'Discord\'a bağlanılamadı'}`);
  } finally {
    utils.toggleLoading(false);
  }
}
function handleLogout() {
  api.clearToken();
  localStorage.removeItem('discord_bot_token');
  utils.showSection('login-section');
  const tokenInput = document.getElementById('token-input');
  if (tokenInput) {
    tokenInput.value = '';
  }
}
async function handleRefresh() {
  try {
    const botData = await api.fetchAllBotData();
    ui.renderDashboard(botData);
  } catch (error) {
    console.error('Yenileme hatası:', error);
    utils.showError('refresh-error', 'Veriler yenilenirken bir hata oluştu');
  }
}
async function checkSavedToken() {
  const savedToken = localStorage.getItem('discord_bot_token');
  
  if (savedToken) {
    api.setToken(savedToken);
    
    try {
      const cachedData = utils.retrieveData('bot_data');
      
      if (cachedData) {
        ui.renderDashboard(cachedData);
        utils.showSection('dashboard-section');
      }
      const isValid = await api.testToken(savedToken);
      
      if (isValid) {
        const botData = await api.fetchAllBotData();
        ui.renderDashboard(botData);
        utils.showSection('dashboard-section');
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Otomatik giriş hatası:', error);
      handleLogout();
    }
  }
}