const ui = {
  init() {
    const togglePasswordButton = document.querySelector('.toggle-password');
    if (togglePasswordButton) {
      togglePasswordButton.addEventListener('click', this.togglePasswordVisibility);
    }
    const serverSearchInput = document.getElementById('server-search');
    if (serverSearchInput) {
      serverSearchInput.addEventListener('input', this.handleServerSearch);
    }
  },
  togglePasswordVisibility() {
    const input = document.getElementById('token-input');
    const eyeIcon = document.querySelector('.eye-icon');
    const eyeOffIcon = document.querySelector('.eye-off-icon');
    
    if (input.type === 'password') {
      input.type = 'text';
      eyeIcon.classList.add('hidden');
      eyeOffIcon.classList.remove('hidden');
    } else {
      input.type = 'password';
      eyeIcon.classList.remove('hidden');
      eyeOffIcon.classList.add('hidden');
    }
  },
  
  /**
   * @param {Event} event
   */
  handleServerSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const serverCards = document.querySelectorAll('.server-card');
    
    serverCards.forEach(card => {
      const serverName = card.querySelector('.server-name').textContent.toLowerCase();
      const isVisible = serverName.includes(searchTerm);
      card.style.display = isVisible ? 'block' : 'none';
    });
  },
  
  /**
   * @param {Object} data 
   */
  renderDashboard(data) {
    if (!data) return;
    this.updateBotInfo(data.bot);
    const serverCountElement = document.getElementById('server-count');
    if (serverCountElement) {
      serverCountElement.textContent = utils.formatNumber(data.guilds.length);
    }
    const userCountElement = document.getElementById('user-count');
    if (userCountElement) {
      userCountElement.textContent = utils.formatNumber(data.totalUsers);
    }
    const channelCountElement = document.getElementById('channel-count');
    if (channelCountElement) {
      channelCountElement.textContent = utils.formatNumber(data.totalChannels);
    }
    this.renderServerList(data.guilds, data.guildDetails);
  },
  
  /**
   * @param {Object} bot
   */
  updateBotInfo(bot) {
    if (!bot) return;
    const avatarElement = document.getElementById('bot-avatar');
    if (avatarElement) {
      const avatarUrl = bot.avatar 
        ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
      avatarElement.src = avatarUrl;
    }
    const nameElement = document.getElementById('bot-name');
    if (nameElement) {
      nameElement.textContent = bot.username;
    }
    const idElement = document.getElementById('bot-id');
    if (idElement) {
      idElement.textContent = `ID: ${bot.id}`;
    }
  },
  
  /**
   * @param {Array} guilds
   * @param {Object} guildDetails 
   */
  renderServerList(guilds, guildDetails) {
    const serverListElement = document.getElementById('server-list');
    const loadingElement = document.getElementById('servers-loading');
    
    if (!serverListElement) return;
    if (loadingElement) {
      loadingElement.remove();
    }
    serverListElement.innerHTML = '';
    const sortedGuilds = [...guilds].sort((a, b) => a.name.localeCompare(b));
    sortedGuilds.forEach(guild => {
      const details = guildDetails[guild.id] || {};
      const card = this.createServerCard(guild, details);
      serverListElement.appendChild(card);
    });
    if (sortedGuilds.length === 0) {
      const emptyMessage = utils.createElement('div', { className: 'empty-message' }, 
        'Sunucu bulunamadı. Botunuz henüz hiçbir Discord sunucusuna eklenmemiş.'
      );
      serverListElement.appendChild(emptyMessage);
    }
  },
  
  /**
   * @param {Object} guild 
   * @param {Object} details
   * @returns {HTMLElement} 
   */
  createServerCard(guild, details) {
    const memberCount = details.approximate_member_count || details.member_count || 'Bilinmiyor';
    const channelCount = details.channels?.length || 'Bilinmiyor';
    let iconContent;
    if (guild.icon) {
      iconContent = utils.createElement('img', {
        src: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
        alt: `${guild.name} ikonu`,
        width: 48,
        height: 48
      });
    } else {
      iconContent = utils.getInitials(guild.name);
    }
    const detailItems = [
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        text: `${memberCount} üye`
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        text: `${channelCount} kanal`
      },
      {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',
        text: `ID: ${guild.id}`
      }
    ];
    const serverIcon = utils.createElement('div', { className: 'server-icon' }, 
      typeof iconContent === 'string' ? iconContent : [iconContent]
    );
    const serverDetails = utils.createElement('div', { className: 'server-details' },
      detailItems.map(item => {
        const detail = utils.createElement('div', { className: 'server-detail' });
        detail.innerHTML = item.icon;
        detail.appendChild(document.createTextNode(' ' + item.text));
        return detail;
      })
    );
    return utils.createElement('div', { className: 'server-card' }, [
      serverIcon,
      utils.createElement('div', { className: 'server-name' }, guild.name),
      serverDetails
    ]);
  }
};
window.ui = ui;