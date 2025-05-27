const api = {
  baseUrl: 'https://discord.com/api/v10',
  token: null,
  
  setToken(token) {
    this.token = token;
  },
  clearToken() {
    this.token = null;
    localStorage.removeItem('bot_data');
  },
  
  async request(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('No token provided');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    
    const fetchOptions = {
      ...options,
      headers: {
        Authorization: `Bot ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      if (response.status === 429) {
        const rateLimitData = await response.json();
        const retryAfter = rateLimitData.retry_after || 1;
        console.warn(`Rate limited. Retrying after ${retryAfter} seconds`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.request(endpoint, options);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },
  
  async getBotInfo() {
    return this.request('/users/@me');
  },
  async getGuilds() {
    return this.request('/users/@me/guilds');
  },
  async getGuildDetails(guildId) {
    return this.request(`/guilds/${guildId}?with_counts=true`);
  },
  async getGuildChannels(guildId) {
    return this.request(`/guilds/${guildId}/channels`);
  },
  async testToken(token) {
    const originalToken = this.token;
    this.token = token;
    
    try {
      await this.getBotInfo();
      return true;
    } catch (error) {
      return false;
    } finally {
      this.token = originalToken;
    }
  },
  
  async fetchAllBotData() {
    try {
      utils.toggleLoading(true, 'Bot bilgileri alınıyor...');
      const botInfo = await this.getBotInfo();
      
      utils.toggleLoading(true, 'Sunucular alınıyor...');
      const guilds = await this.getGuilds();
      const guildDetails = {};
      const memberCounts = {};
      let totalChannels = 0;
      const batchSize = 10;
      for (let i = 0; i < guilds.length; i += batchSize) {
        const batch = guilds.slice(i, i + batchSize);
        
        utils.toggleLoading(true, `Sunucu detayları alınıyor... (${i + 1}-${Math.min(i + batchSize, guilds.length)} / ${guilds.length})`);
        
        await Promise.all(batch.map(async guild => {
          try {
            const details = await this.getGuildDetails(guild.id);
            const channels = await this.getGuildChannels(guild.id);
            details.channels = channels;
            totalChannels += channels.length;
            
            guildDetails[guild.id] = details;
            memberCounts[guild.id] = details.approximate_member_count || 0;
          } catch (error) {
            console.error(`Error fetching details for guild ${guild.id}:`, error);
            guildDetails[guild.id] = { error: true };
            memberCounts[guild.id] = 0;
          }
        }));
      }
      const totalUsers = Object.values(memberCounts).reduce((sum, count) => sum + count, 0);
      const botData = {
        bot: botInfo,
        guilds,
        guildDetails,
        totalUsers,
        totalChannels,
        fetchedAt: new Date().toISOString()
      };
      utils.storeData('bot_data', botData);
      
      return botData;
    } finally {
      utils.toggleLoading(false);
    }
  }
};
window.api = api;