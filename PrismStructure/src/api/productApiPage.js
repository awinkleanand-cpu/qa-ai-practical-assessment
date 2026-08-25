const { apiBaseUrl } = require('../utils/env');

class ProductApiPage {
  constructor(request) {
    this.request = request;
    this.baseUrl = apiBaseUrl();
  }

  async list(params = {}) {
    return this.request.get(`${this.baseUrl}/products`, { params });
  }

  async search(q) {
    return this.request.get(`${this.baseUrl}/products/search`, { params: { q } });
  }

  async getById(id) {
    return this.request.get(`${this.baseUrl}/products/${id}`);
  }

  async findInStock(query, preferredName) {
    const response = await this.search(query);
    const body = await response.json();
    const items = Array.isArray(body) ? body : body.data || [];
    const preferred = items.find(
      (product) => product.name === preferredName && product.in_stock !== false
    );
    if (preferred) {
      return preferred;
    }
    return items.find((product) => product.in_stock !== false) || items[0];
  }
}

module.exports = { ProductApiPage };
