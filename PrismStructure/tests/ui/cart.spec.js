const { test, expect } = require('../../src/fixtures/test');
const { products, messages } = require('../../src/data');

function parseMoney(text) {
  return Number(String(text).replace(/[^0-9.]/g, ''));
}

async function catalogProduct(productApi, search) {
  const found = await productApi.findInStock(search.query, search.name);
  expect(found && found.name).toBeTruthy();
  return { query: search.query, name: found.name };
}

test.describe('Cart', () => {
  test('@regression cart quantity clamps below 1 and above 99', async ({
    productApi,
    homePage,
    productPage,
    cartPage,
  }) => {
    test.setTimeout(45_000);

    const pliers = await catalogProduct(productApi, products.SEARCH.pliers);
    expect(pliers.name).toBeTruthy();

    await homePage.open();
    await homePage.search(pliers.query);
    await homePage.openProduct(pliers.name);
    await productPage.waitForName(pliers.name);
    await productPage.addToCart();

    await cartPage.open();
    await expect(cartPage.productTitle(pliers.name)).toBeVisible();
    await expect(cartPage.emptyMessage).toBeHidden();

    const unitPrice = parseMoney(await cartPage.unitPriceFor(pliers.name).innerText());

    await cartPage.setQuantityFor(pliers.name, products.QTY.belowMin);
    await expect(cartPage.qtyInputFor(pliers.name)).toHaveValue(
      String(products.QTY.clampedMin)
    );
    expect(
      parseMoney(await cartPage.linePriceFor(pliers.name).innerText())
    ).toBeCloseTo(unitPrice * products.QTY.clampedMin, 2);
    await expect(cartPage.productTitle(pliers.name)).toBeVisible();

    await cartPage.setQuantityFor(pliers.name, products.QTY.aboveMax);
    await expect(cartPage.qtyInputFor(pliers.name)).toHaveValue(
      String(products.QTY.clampedMax)
    );
    await expect(cartPage.qtyMaxWarning).toBeVisible();
    expect(
      parseMoney(await cartPage.linePriceFor(pliers.name).innerText())
    ).toBeCloseTo(unitPrice * products.QTY.clampedMax, 2);
  });

  test('@regression empty cart shows empty copy and hides proceed to checkout', async ({
    cartApi,
    homePage,
    cartPage,
  }) => {
    await homePage.open();
    const created = await cartApi.create();
    expect(created.ok()).toBeTruthy();
    const cart = await created.json();
    expect(cart.id).toBeTruthy();
    await cartPage.bindCartId(cart.id);
    await cartPage.openWhenEmpty();

    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.emptyMessage).toHaveText(messages.EMPTY_CART);
    await expect(cartPage.proceedToCheckout).toBeHidden();
    await expect(cartPage.productTitles).toHaveCount(0);
  });
});
