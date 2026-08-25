const { apiBaseUrl } = require('../utils/env');

class InvoiceApiPage {
  constructor(request) {
    this.request = request;
    this.baseUrl = apiBaseUrl();
  }

  _headers(token) {
    if (!token) {
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  }

  /** API invoice is a single POST — Confirm twice is UI-only. */
  async create(payload, token) {
    return this.request.post(`${this.baseUrl}/invoices`, {
      headers: this._headers(token),
      data: payload,
    });
  }

  async list(token) {
    return this.request.get(`${this.baseUrl}/invoices`, {
      headers: this._headers(token),
    });
  }

  async getById(invoiceId, token) {
    return this.request.get(`${this.baseUrl}/invoices/${invoiceId}`, {
      headers: this._headers(token),
    });
  }
}

module.exports = { InvoiceApiPage };
