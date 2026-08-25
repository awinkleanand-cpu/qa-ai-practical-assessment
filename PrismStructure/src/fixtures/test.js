const base = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { LoginPage } = require('../pages/LoginPage');
const { RegisterPage } = require('../pages/RegisterPage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { InvoicesPage } = require('../pages/InvoicesPage');
const { ProfilePage } = require('../pages/ProfilePage');
const { AuthApiPage } = require('../api/authApiPage');
const { CartApiPage } = require('../api/cartApiPage');
const { ProductApiPage } = require('../api/productApiPage');
const { InvoiceApiPage } = require('../api/invoiceApiPage');

const test = base.test.extend({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  invoicesPage: async ({ page }, use) => {
    await use(new InvoicesPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  authApi: async ({ request }, use) => {
    await use(new AuthApiPage(request));
  },
  cartApi: async ({ request }, use) => {
    await use(new CartApiPage(request));
  },
  productApi: async ({ request }, use) => {
    await use(new ProductApiPage(request));
  },
  invoiceApi: async ({ request }, use) => {
    await use(new InvoiceApiPage(request));
  },
});

module.exports = { test, expect: base.expect };
