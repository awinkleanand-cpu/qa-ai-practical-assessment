const { apiBaseUrl } = require('../utils/env');

class CartApiPage {
  constructor(request) {
    this.request = request;
    this.baseUrl = apiBaseUrl();
  }

  async create() {
    return this.request.post(`${this.baseUrl}/carts`);
  }

  async addItem(cartId, productId, quantity = 1) {
    return this.request.post(`${this.baseUrl}/carts/${cartId}`, {
      data: { product_id: productId, quantity },
    });
  }

  async get(cartId) {
    return this.request.get(`${this.baseUrl}/carts/${cartId}`);
  }

  async updateQuantity(cartId, productId, quantity) {
    return this.request.put(`${this.baseUrl}/carts/${cartId}/product/quantity`, {
      data: { product_id: productId, quantity },
    });
  }

  async delete(cartId) {
    return this.request.delete(`${this.baseUrl}/carts/${cartId}`);
  }
}

module.exports = { CartApiPage };
