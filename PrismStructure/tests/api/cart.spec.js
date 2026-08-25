const { test, expect } = require('../../src/fixtures/test');

const INVALID_CART_ID = '00000000-0000-0000-0000-000000000000';

test.describe('API cart negatives', () => {
  test('@regression GET /carts/{cartId} with an unknown id returns 404', async ({
    cartApi,
  }) => {
    const cartResponse = await cartApi.get(INVALID_CART_ID);
    expect(cartResponse.status()).toBe(404);
    const cartBody = await cartResponse.json();
    expect(cartBody).toHaveProperty('message');
    expect(cartBody.message).toBe('Requested item not found');
  });
});
