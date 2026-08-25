const { test, expect } = require('../../src/fixtures/test');
const { users, billing } = require('../../src/data');

test.describe('API auth and invoice negatives', () => {
  test('@regression POST /invoices without a bearer token is rejected', async ({
    cartApi,
    invoiceApi,
  }) => {
    const createCartResponse = await cartApi.create();
    expect(createCartResponse.status()).toBe(201);
    const createdCart = await createCartResponse.json();
    expect(createdCart).toHaveProperty('id');
    const cartId = createdCart.id;

    const invoiceResponse = await invoiceApi.create(billing.invoicePayload(cartId));
    expect(invoiceResponse.status()).toBe(401);
  });

  test('@regression register with a duplicate email returns 409', async ({ authApi }) => {
    const customer = users.createUniqueCustomer();

    const registerResponse = await authApi.register(customer.apiPayload);
    expect(registerResponse.status()).toBe(201);
    const registerBody = await registerResponse.json();
    expect(registerBody.email).toBe(customer.email);

    const duplicateResponse = await authApi.register(customer.apiPayload);
    expect(duplicateResponse.status()).toBe(409);
  });

  test('@regression login with a wrong password is rejected', async ({ authApi }) => {
    const customer = users.createUniqueCustomer();

    const registerResponse = await authApi.register(customer.apiPayload);
    expect(registerResponse.status()).toBe(201);

    // OpenAPI documents no login error codes. Live POST /users/login returns 401 { error }.
    const loginResponse = await authApi.login(customer.email, users.wrongPassword());
    expect(loginResponse.status()).toBe(401);
    const loginBody = await loginResponse.json();
    expect(loginBody).toHaveProperty('error');
    expect(loginBody.error).toBe('Unauthorized');
    expect(loginBody).not.toHaveProperty('access_token');
  });

  test('@regression POST /invoices with a malformed bearer token is rejected', async ({
    cartApi,
    invoiceApi,
  }) => {
    const createCartResponse = await cartApi.create();
    expect(createCartResponse.status()).toBe(201);
    const createdCart = await createCartResponse.json();
    expect(createdCart).toHaveProperty('id');

    const invoiceResponse = await invoiceApi.create(
      billing.invoicePayload(createdCart.id),
      'not-a-jwt'
    );
    expect(invoiceResponse.status()).toBe(401);
    const invoiceBody = await invoiceResponse.json();
    expect(invoiceBody).toHaveProperty('message');
    expect(invoiceBody.message).toBe('Unauthorized');
  });

  test('@regression POST /invoices with a token but no cart_id is rejected', async ({
    authApi,
    invoiceApi,
  }) => {
    const customer = users.createUniqueCustomer();

    const registerResponse = await authApi.register(customer.apiPayload);
    expect(registerResponse.status()).toBe(201);

    const loginResponse = await authApi.login(customer.email, customer.password);
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    expect(loginBody).toHaveProperty('access_token');
    const token = loginBody.access_token;

    const payload = billing.invoicePayload('unused-cart-id');
    delete payload.cart_id;

    const invoiceResponse = await invoiceApi.create(payload, token);
    expect(invoiceResponse.status()).toBe(422);
    const invoiceBody = await invoiceResponse.json();
    expect(invoiceBody).toHaveProperty('cart_id');
    expect(invoiceBody.cart_id).toEqual(
      expect.arrayContaining(['The cart id field is required.'])
    );
  });
});
