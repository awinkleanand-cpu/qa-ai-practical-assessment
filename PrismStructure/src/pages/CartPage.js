class CartPage {
  constructor(page) {
    this.page = page;
    this.proceedToCheckout = page.getByTestId('proceed-1');
    this.continueShopping = page.getByTestId('continue-shopping');
    this.emptyMessage = page.getByText('The cart is empty. Nothing to display.');
    this.qtyInputs = page.getByTestId('product-quantity');
    this.productTitles = page.getByTestId('product-title');
    this.cartTotal = page.getByTestId('cart-total');
  }

  async open() {
    await this.page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await this.productTitles.first().waitFor({ state: 'visible' });
  }

  async clearSessionCart() {
    await this.page.evaluate(() => sessionStorage.removeItem('cart_id'));
  }

  qtyInput(index = 0) {
    return this.qtyInputs.nth(index);
  }

  lineByProduct(name) {
    return this.page
      .locator('tr')
      .filter({ has: this.page.getByTestId('product-title').filter({ hasText: name }) });
  }

  productTitle(name) {
    return this.productTitles.filter({ hasText: name });
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
