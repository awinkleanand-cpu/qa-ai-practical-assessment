const COD = 'cash-on-delivery';
const COD_LABEL = 'Cash on Delivery';

const billingAddress = {
  street: 'de Bruijnsingel',
  city: 'Idaerd',
  state: 'Limburg',
  country: 'Netherlands',
  countryCode: 'NL',
  houseNumber: '1',
  postalCode: '1234AA',
};

function invoicePayload(cartId, address = billingAddress) {
  return {
    billing_street: address.street,
    billing_city: address.city,
    billing_state: address.state,
    billing_country: address.countryCode || address.country,
    billing_postal_code: address.postalCode,
    payment_method: COD,
    cart_id: cartId,
    payment_details: {},
  };
}

module.exports = { COD, COD_LABEL, billingAddress, invoicePayload };
