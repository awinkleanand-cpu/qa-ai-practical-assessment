const { messages } = require('../data');

class CartPage {
  constructor(page) {
    this.page = page;
    this.proceedToCheckout = page.getByTestId('proceed-1');
    this.continueShopping = page.getByTestId('continue-shopping');
    this.emptyMessage = page.getByText(messages.EMPTY_CART);
    this.qtyMaxWarning = page.getByText(messages.QTY_MAX_WARNING);
    this.qtyInputs = page.getByTestId('product-quantity');
    this.productTitles = page.getByTestId('product-title');
    this.cartTotal = page.getByTestId('cart-total');
  }

  async open() {
    await this.page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await this.productTitles.first().waitFor({ state: 'visible' });
  }

  async openWhenEmpty() {
    await this.page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await this.emptyMessage.waitFor({ state: 'visible' });
  }

  async clearSessionCart() {
    await this.page.evaluate(() => {
      sessionStorage.removeItem('cart_id');
      sessionStorage.removeItem('cart_quantity');
    });
  }

  async bindCartId(cartId) {
    await this.page.evaluate((id) => {
      sessionStorage.setItem('cart_id', id);
      sessionStorage.setItem('cart_quantity', '0');
    }, cartId);
  }

  qtyInput(index = 0) {
    return this.qtyInputs.nth(index);
  }

  lineByProduct(name) {
    return this.page.locator('tr').filter({
      has: this.page.getByTestId('product-title').getByText(name, { exact: true }),
    });
  }

  productTitle(name) {
    return this.productTitles.getByText(name, { exact: true });
  }

  qtyInputFor(name) {
    return this.lineByProduct(name).getByTestId('product-quantity');
  }

  unitPriceFor(name) {
    return this.lineByProduct(name).getByTestId('product-price');
  }

  linePriceFor(name) {
    return this.lineByProduct(name).getByTestId('line-price');
  }

  async setQuantity(index, value) {
    const input = this.qtyInput(index);
    await this._setQuantityOn(input, value);
  }

  async setQuantityFor(name, value) {
    await this._setQuantityOn(this.qtyInputFor(name), value);
  }

  async _setQuantityOn(input, value) {
    const updated = this.page.waitForResponse(
      (res) =>
        res.url().includes('/product/quantity') &&
        res.request().method() === 'PUT' &&
        res.ok()
    );
    await input.fill(String(value));
    await input.dispatchEvent('change');
    await updated;
  }

  async proceed() {
    await this.proceedToCheckout.click();
  }
}

module.exports = { CartPage };
