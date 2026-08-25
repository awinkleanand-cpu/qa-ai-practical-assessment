const { messages } = require('../data');

class ProductPage {
  constructor(page) {
    this.page = page;
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.increaseQty = page.getByTestId('increase-quantity');
    this.decreaseQty = page.getByTestId('decrease-quantity');
    this.quantity = page.getByTestId('quantity');
    this.productName = page.getByTestId('product-name');
  }

  async waitForName(name) {
    await this.productName.filter({ hasText: name }).waitFor({ state: 'visible' });
  }

  async addToCart() {
    await this.addToCartButton.waitFor({ state: 'visible' });
    const itemAdded = this.page.waitForResponse((res) => {
      if (
        !res.url().includes('/carts') ||
        res.request().method() !== 'POST' ||
        !res.ok()
      ) {
        return false;
      }
      const body = res.request().postData() || '';
      return body.includes('product_id');
    });
    await this.addToCartButton.click();
    await itemAdded;
    await this.page.getByText(messages.PRODUCT_ADDED).waitFor({ state: 'visible' });
  }
}

module.exports = { ProductPage };
