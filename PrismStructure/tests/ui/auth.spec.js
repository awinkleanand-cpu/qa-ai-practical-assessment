const { test, expect } = require('../../src/fixtures/test');
const { users, messages } = require('../../src/data');

test.describe('Registration and login', () => {
  test('@smoke unique customer can register, log in, and see matching profile', async ({
    page,
    registerPage,
    loginPage,
    profilePage,
    homePage,
  }) => {
    const customer = users.createUniqueCustomer();

    await registerPage.open();
    const registerResponse = await registerPage.register(customer);
    expect(registerResponse.status()).toBe(201);
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(loginPage.emailInput).toBeVisible();

    await loginPage.login(customer.email, customer.password);
    await expect(page).toHaveURL(/\/account/);
    await expect(homePage.userMenu).toBeVisible();
    await expect(homePage.signInLink).toBeHidden();

    await profilePage.openFromMenu();
    await expect(page).toHaveURL(/\/account\/profile/);
    await expect(profilePage.firstName).toHaveValue(customer.firstName);
    await expect(profilePage.lastName).toHaveValue(customer.lastName);
    await expect(profilePage.email).toHaveValue(customer.email);
  });

  test('@regression login with wrong password is rejected', async ({
    page,
    authApi,
    loginPage,
    homePage,
  }) => {
    const customer = users.createUniqueCustomer();
    const registerResponse = await authApi.register(customer.apiPayload);
    expect(registerResponse.status()).toBe(201);

    await loginPage.open();
    await loginPage.login(customer.email, users.wrongPassword());

    await expect(loginPage.errorAlert).toBeVisible();
    await expect(loginPage.errorAlert).toContainText(messages.INVALID_LOGIN);
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(homePage.userMenu).toBeHidden();
    await expect(homePage.signInLink).toBeVisible();
  });

  test('@regression register with an email already in use is rejected', async ({
    page,
    authApi,
    registerPage,
  }) => {
    const customer = users.createUniqueCustomer();
    const registerResponse = await authApi.register(customer.apiPayload);
    expect(registerResponse.status()).toBe(201);

    await registerPage.open();
    const duplicateResponse = await registerPage.register(customer);
    expect(duplicateResponse.ok()).toBeFalsy();

    await expect(registerPage.errorAlert).toBeVisible();
    await expect(registerPage.errorAlert).toContainText(messages.EMAIL_IN_USE);
    await expect(page).toHaveURL(/\/auth\/register/);
    await expect(registerPage.firstName).toBeVisible();
  });
});
