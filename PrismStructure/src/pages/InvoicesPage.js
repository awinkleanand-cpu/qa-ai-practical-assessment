class InvoicesPage {
  constructor(page) {
    this.page = page;
    this.navLink = page.getByTestId('nav-my-invoices');
    this.detailsLinks = page.getByRole('link', { name: 'Details' });
    this.invoiceNumber = page.getByTestId('invoice-number');
    this.paymentMethod = page.getByTestId('payment-method');
    this.productsHeading = page.getByRole('heading', { name: 'Products' });
  }

  async openFromMenu() {
    await this.page.getByTestId('nav-menu').click();
    await this.navLink.click();
    await this.page.waitForURL(/\/account\/invoices/, {
      waitUntil: 'domcontentloaded',
    });
  }

  async open() {
    await this.page.goto('/account/invoices', { waitUntil: 'domcontentloaded' });
  }

  rowForInvoice(invoiceNumber) {
    return this.page.getByRole('row').filter({ hasText: String(invoiceNumber) });
  }

  lineRow(productName) {
    return this.page.getByRole('row').filter({ hasText: productName });
  }

  async openDetailsFor(invoiceNumber) {
    await this.rowForInvoice(invoiceNumber)
      .getByRole('link', { name: 'Details' })
      .click();
    await this.page.waitForURL(/\/account\/invoices\/.+/, {
      waitUntil: 'domcontentloaded',
    });
    await this.invoiceNumber.waitFor({ state: 'visible' });
  }

  async openFirstDetails() {
    await this.detailsLinks.first().click();
    await this.invoiceNumber.waitFor({ state: 'visible' });
  }
}

module.exports = { InvoicesPage };
