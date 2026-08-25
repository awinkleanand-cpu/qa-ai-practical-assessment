class LoginPage {
  constructor(page) {
    this.page = page;
    this.form = page.getByTestId('login-form');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    this.registerLink = page.getByTestId('register-link');
    this.errorAlert = page.getByTestId('login-error');
  }

  async open() {
    await this.page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    const loginResponse = this.page.waitForResponse(
      (res) =>
        res.url().includes('/users/login') &&
        res.request().method() === 'POST'
    );
    await this.submitButton.click();
    const result = await loginResponse;
    // Header nav-menu renders only after GET /users/me sets name + role.
    // Wait on the menu (not a pre-click /users/me listener) so a failed login
    // does not leave a dangling waiter, and a fast /users/me is not missed.
    if (result.ok()) {
      await this.page.getByTestId('nav-menu').waitFor({ state: 'visible' });
    }
  }

  async goToRegister() {
    await this.registerLink.click();
  }
}

module.exports = { LoginPage };
