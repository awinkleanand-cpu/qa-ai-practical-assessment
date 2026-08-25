class RegisterPage {
  constructor(page) {
    this.page = page;
    this.form = page.getByTestId('register-form');
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.dob = page.getByTestId('dob');
    this.street = page.getByTestId('street');
    this.postalCode = page.getByTestId('postal_code');
    this.houseNumber = page.getByTestId('house_number');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.country = page.getByTestId('country');
    this.phone = page.getByTestId('phone');
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submitButton = page.getByTestId('register-submit');
    this.errorAlert = page.getByTestId('register-error');
  }

  async open() {
    await this.page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
    await this.firstName.waitFor({ state: 'visible' });
  }

  async fillCustomer(customer) {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.dob.fill(customer.dob);
    if (customer.countryCode) {
      await this.country.selectOption(customer.countryCode);
    } else {
      await this.country.selectOption({ label: customer.country });
    }
    await this.postalCode.fill(customer.postalCode);
    await this.houseNumber.fill(customer.houseNumber);
    await this.street.fill(customer.street);
    await this.city.fill(customer.city);
    await this.state.fill(customer.state);
    await this.phone.fill(customer.phone);
    await this.email.fill(customer.email);
    await this.password.fill(customer.password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async register(customer) {
    await this.fillCustomer(customer);
    const created = this.page.waitForResponse(
      (res) =>
        res.url().includes('/users/register') &&
        res.request().method() === 'POST'
    );
    await this.submit();
    return created;
  }
}

module.exports = { RegisterPage };
