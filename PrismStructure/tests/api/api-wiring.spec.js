const { test, expect } = require('../../src/fixtures/test');

test('@smoke API wiring: GET /products returns a catalog page', async ({ productApi }) => {
  const response = await productApi.list();
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(Array.isArray(body.data)).toBeTruthy();
  expect(body.data.length).toBeGreaterThan(0);
});
