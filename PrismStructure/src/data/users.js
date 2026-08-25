const { uniqueEmail, uniquePassword } = require('../utils/unique');

function validPassword() {
  return process.env.TEST_PASSWORD || uniquePassword();
}

function wrongPassword() {
  return 'WrongPass1!';
}

function registerProfile() {
  return {
    firstName: 'Ava',
    lastName: 'Mercer',
    dob: '1990-01-15',
    country: 'Austria',
    countryCode: 'AT',
    postalCode: '1234AA',
    houseNumber: '1',
    phone: '1234567890',
    street: 'Test Street 1',
    city: 'Utrecht',
    state: 'Utrecht',
  };
}

function newCustomer() {
  const profile = registerProfile();
  const email = uniqueEmail('user');
  const password = validPassword();

  return {
    ...profile,
    email,
    password,
    apiPayload: {
      first_name: profile.firstName,
      last_name: profile.lastName,
      dob: profile.dob,
      phone: profile.phone,
      email,
      password,
      address: {
        street: profile.street,
        house_number: profile.houseNumber,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        postal_code: profile.postalCode,
      },
    },
  };
}

function createUniqueCustomer() {
  return newCustomer();
}

module.exports = {
  uniqueEmail,
  uniquePassword,
  validPassword,
  wrongPassword,
  registerProfile,
  newCustomer,
  createUniqueCustomer,
};
