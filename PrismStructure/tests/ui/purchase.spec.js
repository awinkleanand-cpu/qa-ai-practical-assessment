const { test, expect } = require('../../src/fixtures/test');
const { users, products, billing, messages } = require('../../src/data');

function parseMoney(text) {
  return Number(String(text).replace(/[^0-9.]/g, ''));
}

async function catalogProduct(productApi, search) {
  const found = await productApi.findInStock(search.query, search.name);
  expect(found && found.name).toBeTruthy();
  return { query: search.query, name: found.name };
}

test.describe('Purchase flow', () => {
  test('@smoke @regression unique customer can search, update cart, checkout COD, and see invoice', async ({
    page,
    authApi,
    productApi,
    loginPage,
    homePage,
    productPage,
    cartPage,
    checkoutPage,
    invoicesPage,
  }) => {
    test.setTimeout(60_000);

    const customer = users.createUniqueCustomer();
    const registerResponse = await authApi.register(customer.apiPayload);
    expect(registerResponse.status()).toBe(201);

    const pliers = await catalogProduct(productApi, products.SEARCH.pliers);
    const hammer = await catalogProduct(productApi, products.SEARCH.hammer);
    expect(pliers.name).toBeTruthy();
    expect(hammer.name).toBeTruthy();
    expect(pliers.name).not.toBe(hammer.name);

    await loginPage.open();
    await loginPage.login(customer.email, customer.password);
    await expect(page).toHaveURL(/\/account/);
    await expect(homePage.userMenu).toBeVisible();
    await cartPage.clearSessionCart();

    await homePage.open();
    await homePage.search(pliers.query);
    await homePage.openProduct(pliers.name);
    await productPage.waitForName(pliers.name);
    await productPage.addToCart();

    await homePage.open();
    await homePage.search(hammer.query);
    await homePage.openProduct(hammer.name);
    await productPage.waitForName(hammer.name);
    await productPage.addToCart();

    await cartPage.open();
    await expect(cartPage.productTitles).toHaveCount(2);
    await expect(cartPage.productTitle(pliers.name)).toBeVisible();
    await expect(cartPage.productTitle(hammer.name)).toBeVisible();
    await expect(cartPage.emptyMessage).toBeHidden();

    const unitPrice = parseMoney(await cartPage.unitPriceFor(pliers.name).innerText());
    const expectedLine = (unitPrice * products.QTY.increaseTo).toFixed(2);
    await cartPage.setQuantityFor(pliers.name, products.QTY.increaseTo);
    await expect(cartPage.qtyInputFor(pliers.name)).toHaveValue(
      String(products.QTY.increaseTo)
    );
    await expect(cartPage.linePriceFor(pliers.name)).toContainText(expectedLine);
    await expect(cartPage.cartTotal).toBeVisible();
    const cartTotal = parseMoney(await cartPage.cartTotal.innerText());
    expect(cartTotal).toBeGreaterThan(unitPrice);

    await cartPage.proceed();
    await checkoutPage.proceedFromSignIn();
    await checkoutPage.fillBilling(billing.billingAddress);
    await expect(checkoutPage.country).toHaveValue(billing.billingAddress.countryCode);
    await expect(checkoutPage.city).toHaveValue(billing.billingAddress.city);
    await expect(checkoutPage.street).toHaveValue(billing.billingAddress.street);
    await expect(checkoutPage.proceedBilling).toBeEnabled();
    await checkoutPage.proceedFromBilling();

    await checkoutPage.chooseCashOnDelivery();
    await expect(checkoutPage.paymentMethod).toHaveValue(billing.COD);

    const invoice = await checkoutPage.confirmTwice();
    expect(invoice.invoice_number).toBeTruthy();
    await expect(checkoutPage.orderConfirmation).toContainText(messages.ORDER_THANKS);
    await expect(checkoutPage.orderConfirmation).toContainText(
      String(invoice.invoice_number)
    );

    await invoicesPage.openFromMenu();
    await expect(invoicesPage.rowForInvoice(invoice.invoice_number)).toBeVisible();
    await invoicesPage.openDetailsFor(invoice.invoice_number);
    await expect(invoicesPage.invoiceNumber).toHaveValue(String(invoice.invoice_number));
    await expect(invoicesPage.paymentMethod).toHaveValue(billing.COD_LABEL);

    const pliersLine = invoicesPage.lineRow(pliers.name);
    await expect(pliersLine).toBeVisible();
    await expect(pliersLine.getByRole('cell').first()).toHaveText(
      String(products.QTY.increaseTo)
    );
    const hammerLine = invoicesPage.lineRow(hammer.name);
    await expect(hammerLine).toBeVisible();
    await expect(hammerLine.getByRole('cell').first()).toHaveText('1');
  });

  test('@regression a single Confirm on COD checkout does not create an invoice', async ({
    page,
    authApi,
    productApi,
    loginPage,
    homePage,
    productPage,
    cartPage,
    checkoutPage,
    invoicesPage,
  }) => {
    test.setTimeout(60_000);

    const customer = users.createUniqueCustomer();
    const registerResponse = await authApi.register(customer.apiPayload);
    expect(registerResponse.status()).toBe(201);

    const pliers = await catalogProduct(productApi, products.SEARCH.pliers);
    expect(pliers.name).toBeTruthy();

    await loginPage.open();
    await loginPage.login(customer.email, customer.password);
    await expect(page).toHaveURL(/\/account/);
    await expect(homePage.userMenu).toBeVisible();
    await cartPage.clearSessionCart();

    await invoicesPage.openFromMenu();
    const invoiceCountBefore = await invoicesPage.detailsLinks.count();

    await homePage.open();
    await homePage.search(pliers.query);
    await homePage.openProduct(pliers.name);
    await productPage.waitForName(pliers.name);
    await productPage.addToCart();

    await cartPage.open();
    await expect(cartPage.productTitle(pliers.name)).toBeVisible();
    await cartPage.proceed();
    await checkoutPage.proceedFromSignIn();
    await checkoutPage.fillBilling(billing.billingAddress);
    await expect(checkoutPage.proceedBilling).toBeEnabled();
    await checkoutPage.proceedFromBilling();

    await checkoutPage.chooseCashOnDelivery();
    await expect(checkoutPage.paymentMethod).toHaveValue(billing.COD);

    const invoicePosted = await checkoutPage.confirmOnce();
    expect(invoicePosted).toBe(false);
    await expect(checkoutPage.orderConfirmation).toBeHidden();
    await expect(checkoutPage.confirmButton).toBeVisible();
    await expect(page).not.toHaveURL(/\/account\/invoices/);

    await invoicesPage.openFromMenu();
    await expect(invoicesPage.detailsLinks).toHaveCount(invoiceCountBefore);
  });
});
