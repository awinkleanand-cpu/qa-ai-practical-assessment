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
    await this.submitButton.click();
  }

  async goToRegister() {
    await this.registerLink.click();
  }
}

module.exports = { LoginPage };
