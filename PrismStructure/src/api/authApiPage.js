const { apiBaseUrl } = require('../utils/env');

class AuthApiPage {
  constructor(request) {
    this.request = request;
    this.baseUrl = apiBaseUrl();
  }

  async register(userPayload) {
    return this.request.post(`${this.baseUrl}/users/register`, {
      data: userPayload,
    });
  }

  async login(email, password) {
    return this.request.post(`${this.baseUrl}/users/login`, {
      data: { email, password },
    });
  }

  async accessToken(email, password) {
    const response = await this.login(email, password);
    const body = await response.json();
    return body.access_token;
  }

  async me(token) {
    return this.request.get(`${this.baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

module.exports = { AuthApiPage };
