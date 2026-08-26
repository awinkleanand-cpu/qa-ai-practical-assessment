const { expect } = require('@playwright/test');

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
    await this.street.waitFor({ state: 'visible' });
  }

  async proceedFromBilling() {
    await this.proceedBilling.click();
  }

  isPostcodeLookup(res, country) {
    if (!res.url().includes('/postcode-lookup') || res.request().method() !== 'GET') {
      return false;
    }
    try {
      return new URL(res.url()).searchParams.get('country') === country;
    } catch {
      return false;
    }
  }

  async fillBilling(address) {
    await this.street.waitFor({ state: 'visible' });

    // setAddress() patches GET /users/me asynchronously, then postal/house
    // valueChanges call tryPostcodeLookup. Profile country is the full name
    // "Austria", which is not a <select> option value, so the country control
    // stays "". Austria + 1234AA still looks up faker Florida and patchValue
    // writes street/city/state without checking the current country.
    // Wait for postal/house + lookup idle (not country) before selecting NL.
    await expect(this.postalCode).not.toHaveValue('');
    await expect(this.houseNumber).not.toHaveValue('');
    await this.postcodeLoading.waitFor({ state: 'hidden' });

    const countryParam = address.countryCode || address.country;
    const lookup = this.page.waitForResponse((res) =>
      this.isPostcodeLookup(res, countryParam)
    );

    if (address.countryCode) {
      await this.country.selectOption(address.countryCode);
    } else {
      await this.country.selectOption({ label: address.country });
    }
    await this.postalCode.fill(address.postalCode);
    if (address.houseNumber) {
      await this.houseNumber.fill(address.houseNumber);
    }

    const lookupResponse = await lookup;
    await this.postcodeLoading.waitFor({ state: 'hidden' });

    let street = address.street;
    let city = address.city;
    let state = address.state;
    if (lookupResponse.ok()) {
      const result = await lookupResponse.json();
      if (result.street) street = result.street;
      if (result.city) city = result.city;
      if (result.state) state = result.state;
    }

    await this.street.fill(street);
    await this.city.fill(city);
    await this.state.fill(state);

    // A late in-flight Austria lookup can still patch after the NL write.
    await this.postcodeLoading.waitFor({ state: 'hidden' });
    await this.street.fill(street);
    await this.city.fill(city);
    await this.state.fill(state);
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

  /**
   * First Confirm only runs POST /payment/check. Do not click Confirm again.
   * Returns whether POST /invoices fired (must stay false for TC-M-08).
   */
  async confirmOnce() {
    await this.confirmButton.waitFor({ state: 'visible' });

    let invoicePosted = false;
    const onResponse = (res) => {
      if (res.url().includes('/invoices') && res.request().method() === 'POST') {
        invoicePosted = true;
      }
    };
    this.page.on('response', onResponse);

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
    await expect(this.orderConfirmation).toBeHidden();

    this.page.off('response', onResponse);
    return invoicePosted;
  }
}

module.exports = { CheckoutPage };
