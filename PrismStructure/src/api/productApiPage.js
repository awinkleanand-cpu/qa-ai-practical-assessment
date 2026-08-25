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

  /** List and search are paginated `{ data: ProductResponse[] }`, not a raw array. */
  paginatedData(body) {
    return Array.isArray(body && body.data) ? body.data : [];
  }

  inStockFromPage(body) {
    return this.paginatedData(body).filter((product) => product.in_stock !== false);
  }

  async findInStock(query, preferredName) {
    const response = await this.search(query);
    const body = await response.json();
    const items = this.inStockFromPage(body);
    const preferred = items.find((product) => product.name === preferredName);
    if (preferred) {
      return preferred;
    }
    return items[0];
  }
}

module.exports = { ProductApiPage };
