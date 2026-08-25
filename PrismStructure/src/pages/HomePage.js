class HomePage {
  constructor(page) {
    this.page = page;
    this.signInLink = page.getByTestId('nav-sign-in');
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.cartNav = page.getByTestId('nav-cart');
    this.userMenu = page.getByTestId('nav-menu');
  }

  async open() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async goToSignIn() {
    await this.signInLink.click();
  }

  async search(query) {
    await this.searchInput.waitFor({ state: 'visible' });
    await this.searchInput.fill(query);
    await this.searchSubmit.click();
    await this.page.getByRole('heading', { name: `Searched for: ${query}` }).waitFor({
      state: 'visible',
    });
  }

  productByName(name) {
    return this.page.getByRole('heading', { name, exact: true });
  }

  async openProduct(name) {
    const card = this.productByName(name).first();
    await card.waitFor({ state: 'visible' });
    await card.click();
  }
}

module.exports = { HomePage };
