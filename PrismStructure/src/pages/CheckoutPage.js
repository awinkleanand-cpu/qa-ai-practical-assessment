class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.proceedSignIn = page.getByTestId('proceed-2');
    this.proceedBilling = page.getByTestId('proceed-3');
    this.street = page.getByTestId('street');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.houseNumber = page.getByTestId('house_number');
    this.postcodeLoading = page.getByTestId('postcode-lookup-loading');
    this.paymentMethod = page.getByTestId('payment-method');
    this.confirmButton = page.getByTestId('finish');
    this.paymentSuccessMessage = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  async proceedFromSignIn() {
    await this.proceedSignIn.click();
  }

  async proceedFromBilling() {
    await this.proceedBilling.click();
  }

  async fillBilling(address) {
    await this.street.waitFor({ state: 'visible' });
    await this.street.fill('');
    await this.city.fill('');
    await this.state.fill('');
    if (address.countryCode) {
      await this.country.selectOption(address.countryCode);
    } else {
      await this.country.selectOption({ label: address.country });
    }
    await this.postalCode.fill(address.postalCode);
    if (address.houseNumber) {
      await this.houseNumber.fill(address.houseNumber);
    }
    await this.postcodeLoading.waitFor({ state: 'hidden' });
    const lookupFilled = await this.page
      .waitForFunction(
        () => {
          const street = document.querySelector('[data-test="street"]');
          const city = document.querySelector('[data-test="city"]');
          return Boolean(
            street &&
              city &&
              String(street.value || '').trim() &&
              String(city.value || '').trim()
          );
        },
        null,
        { timeout: 8000 }
      )
      .then(() => true)
      .catch(() => false);
    if (!lookupFilled) {
      await this.street.fill(address.street);
      await this.city.fill(address.city);
      await this.state.fill(address.state);
    }
  }

  async chooseCashOnDelivery() {
    await this.paymentMethod.waitFor({ state: 'visible' });
    await this.paymentMethod.selectOption('cash-on-delivery');
  }

  /**
   * First Confirm only runs POST /payment/check. Invoice is created on the second Confirm.
   * Wait for the check response AND the success message (state=true) before clicking
   * again — a fast double-click creates no invoice.
   */
  async confirmTwice() {
    await this.confirmButton.waitFor({ state: 'visible' });

    const paymentCheck = this.page.waitForResponse(
      (res) =>
        res.url().includes('/payment/check') &&
        res.request().method() === 'POST' &&
        res.ok()
    );
    await this.confirmButton.click();
    await paymentCheck;
    await this.paymentSuccessMessage.waitFor({ state: 'visible' });
    await this.confirmButton.waitFor({ state: 'visible' });

    const invoiceCreated = this.page.waitForResponse(
      (res) =>
        res.url().includes('/invoices') &&
        res.request().method() === 'POST'
    );
    await this.confirmButton.click();
    const invoiceResponse = await invoiceCreated;
    if (!invoiceResponse.ok()) {
      const body = await invoiceResponse.text();
      const payload = invoiceResponse.request().postData();
      throw new Error(
        `Invoice POST failed (${invoiceResponse.status()}): ${body} payload=${payload}`
      );
    }
    await this.orderConfirmation.waitFor({ state: 'visible' });
    return invoiceResponse.json();
  }
}

module.exports = { CheckoutPage };
