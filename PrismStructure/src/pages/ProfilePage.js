class ProfilePage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByTestId('page-title');
    this.navLink = page.getByTestId('nav-my-profile');
    this.userMenu = page.getByTestId('nav-menu');
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.email = page.getByTestId('email');
  }

  async openFromMenu() {
    await this.userMenu.click();
    await this.navLink.click();
    await this.page.waitForURL(/\/account\/profile/, {
      waitUntil: 'domcontentloaded',
    });
    await this.firstName.waitFor({ state: 'visible' });
  }

  async open() {
    await this.page.goto('/account/profile', { waitUntil: 'domcontentloaded' });
    await this.firstName.waitFor({ state: 'visible' });
  }
}

module.exports = { ProfilePage };
