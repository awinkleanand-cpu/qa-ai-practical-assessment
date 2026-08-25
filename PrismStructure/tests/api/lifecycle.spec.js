const { test, expect } = require('../../src/fixtures/test');
const { users, billing } = require('../../src/data');

test.describe('API purchase lifecycle', () => {
  test('@smoke @regression unique customer can register, login, cart products, and create a COD invoice', async ({
    authApi,
    productApi,
    cartApi,
    invoiceApi,
  }) => {
    const customer = users.createUniqueCustomer();

    const registerResponse = await authApi.register(customer.apiPayload);
    expect(registerResponse.status()).toBe(201);
    const registerBody = await registerResponse.json();
    expect(registerBody).toHaveProperty('id');
    expect(typeof registerBody.id).toBe('string');
    expect(registerBody.id).toBeTruthy();
    expect(registerBody).toHaveProperty('email');
    expect(registerBody.email).toBe(customer.email);

    const loginResponse = await authApi.login(customer.email, customer.password);
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    expect(loginBody).toHaveProperty('access_token');
    expect(typeof loginBody.access_token).toBe('string');
    expect(loginBody.access_token).toBeTruthy();
    expect(loginBody).toHaveProperty('token_type');
    expect(typeof loginBody.token_type).toBe('string');
    expect(loginBody).toHaveProperty('expires_in');
    const token = loginBody.access_token;

    const productsResponse = await productApi.list();
    expect(productsResponse.status()).toBe(200);
    const productsBody = await productsResponse.json();
    expect(productsBody).toHaveProperty('data');
    expect(Array.isArray(productsBody.data)).toBeTruthy();
    const inStock = productApi.inStockFromPage(productsBody);
    expect(inStock.length).toBeGreaterThanOrEqual(2);
    const firstProduct = inStock[0];
    const secondProduct = inStock.find((product) => product.id !== firstProduct.id);
    expect(firstProduct).toHaveProperty('id');
    expect(secondProduct).toBeTruthy();
    expect(typeof firstProduct.id).toBe('string');
    expect(typeof secondProduct.id).toBe('string');
    expect(firstProduct.id).not.toBe(secondProduct.id);

    const createCartResponse = await cartApi.create();
    expect(createCartResponse.status()).toBe(201);
    const createdCart = await createCartResponse.json();
    expect(createdCart).toHaveProperty('id');
    expect(typeof createdCart.id).toBe('string');
    expect(createdCart.id).toBeTruthy();
    const cartId = createdCart.id;

    const addFirstResponse = await cartApi.addItem(cartId, firstProduct.id, 1);
    expect(addFirstResponse.status()).toBe(200);
    const addFirstBody = await addFirstResponse.json();
    expect(addFirstBody).toHaveProperty('result');
    expect(typeof addFirstBody.result).toBe('string');

    const addSecondResponse = await cartApi.addItem(cartId, secondProduct.id, 1);
    expect(addSecondResponse.status()).toBe(200);
    const addSecondBody = await addSecondResponse.json();
    expect(addSecondBody).toHaveProperty('result');
    expect(typeof addSecondBody.result).toBe('string');

    const getCartResponse = await cartApi.get(cartId);
    expect(getCartResponse.status()).toBe(200);
    const cartBody = await getCartResponse.json();
    expect(cartBody).toHaveProperty('id');
    expect(cartBody.id).toBe(cartId);
    // OpenAPI CartResponse documents only `id`. Live GET currently returns cart_items (extra-schema).
    if (Array.isArray(cartBody.cart_items)) {
      expect(cartBody.cart_items).toHaveLength(2);
      const lineProductIds = cartBody.cart_items.map((line) => line.product_id);
      expect(lineProductIds).toEqual(
        expect.arrayContaining([firstProduct.id, secondProduct.id])
      );
      for (const line of cartBody.cart_items) {
        expect(line.cart_id).toBe(cartId);
        expect(line.quantity).toBe(1);
      }
    }

    const invoiceRequest = billing.invoicePayload(cartId);
    expect(invoiceRequest.payment_method).toBe(billing.COD);
    expect(invoiceRequest.cart_id).toBe(cartId);
    const invoiceResponse = await invoiceApi.create(invoiceRequest, token);
    // OpenAPI documents 200; live Toolshop v5 returns 201. Assert the live success code.
    expect(invoiceResponse.status()).toBe(201);
    const invoice = await invoiceResponse.json();
    expect(invoice).toHaveProperty('id');
    expect(typeof invoice.id).toBe('string');
    expect(invoice.id).toBeTruthy();
    expect(invoice).toHaveProperty('invoice_number');
    expect(typeof invoice.invoice_number).toBe('string');
    expect(invoice.invoice_number).toBeTruthy();
    expect(invoice).toHaveProperty('user_id');
    expect(invoice.user_id).toBeTruthy();
    expect(invoice.billing_country).toBe(invoiceRequest.billing_country);
    expect(invoice.billing_city).toBe(invoiceRequest.billing_city);
    expect(invoice.billing_postal_code).toBe(invoiceRequest.billing_postal_code);
  });
});
