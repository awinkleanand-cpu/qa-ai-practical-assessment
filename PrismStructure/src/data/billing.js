const COD = 'cash-on-delivery';
const COD_LABEL = 'Cash on Delivery';

const billingAddress = {
  street: 'Test Street 1',
  city: 'Utrecht',
  state: 'Utrecht',
  country: 'Netherlands',
  countryCode: 'NL',
  houseNumber: '1',
  postalCode: '1234AA',
};

function invoicePayload(cartId) {
  return {
    billing_street: billingAddress.street,
    billing_city: billingAddress.city,
    billing_state: billingAddress.state,
    billing_country: billingAddress.country,
    billing_postal_code: billingAddress.postalCode,
    payment_method: COD,
    cart_id: cartId,
    payment_details: {},
  };
}

module.exports = { COD, COD_LABEL, billingAddress, invoicePayload };
