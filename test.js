import * as OTPAuth from 'otpauth';

// Create a new TOTP object.
let totp = new OTPAuth.TOTP({
  // Provider or service the account is associated with.
  issuer: 'ft_transcendence',
  // Account identifier.
  label: 'deydoux',
  // Algorithm used for the HMAC function, possible values are:
  //   "SHA1", "SHA224", "SHA256", "SHA384", "SHA512",
  //   "SHA3-224", "SHA3-256", "SHA3-384" and "SHA3-512".
  // algorithm: 'SHA1',
  // Length of the generated tokens.
  // digits: 6,
  // Interval of time for which a token is valid, in seconds.
  // period: 30,
  // Arbitrary key encoded in base32 or `OTPAuth.Secret` instance
  // (if omitted, a cryptographically secure random secret is generated).
  // secret: 'US3WHSG7X5KAPV27VANWKQHF3SH3HULL',
  //   or: `OTPAuth.Secret.fromBase32("US3WHSG7X5KAPV27VANWKQHF3SH3HULL")`
  //   or: `new OTPAuth.Secret()`
  // issuerInLabel: false,
});

console.log(totp.secret.base32);

// Unless you know what you are doing, it is recommended to use the default
// values for the algorithm, digits, and period options, as these are the most
// common values used by most services.

// Generate a cryptographically secure random secret.
// It is NOT recommended to use less than 128 bits (16 bytes).
let secret = new OTPAuth.Secret({size: 20});

// Generate a token (returns the current token as a string).
let token = totp.generate();

// Validate a token (returns the token delta or null if it is not found in the
// search window, in which case it should be considered invalid).
//
// A search window is useful to account for clock drift between the client and
// server; however, it should be kept as small as possible to prevent brute
// force attacks. In most cases, a value of 1 is sufficient. Furthermore, it is
// essential to implement a throttling mechanism on the server.
//
// For further details on the security considerations, it is advised to refer
// to Section 7 of RFC 4226 and Section 5 of RFC 6238:
//   https://datatracker.ietf.org/doc/html/rfc4226#section-7
//   https://datatracker.ietf.org/doc/html/rfc6238#section-5
let delta = totp.validate({token, window: 1});

// Get the counter value (number of intervals since the Unix epoch).
// Useful for implementing techniques against token reuse during the validity
// period.
let counter = totp.counter();

// Get the remaining milliseconds until the current token changes.
let remaining = totp.remaining();

// Convert to Google Authenticator key URI format.
// Usually the URI is encoded in a QR code that can be scanned by the user.
// This functionality is outside the scope of the project, but there are many
// libraries that can be used for this purpose, such as npmjs.com/package/qr
let uri = totp.toString();
console.log(uri);
//   or:      `OTPAuth.URI.stringify(totp)`
//   returns: `otpauth://totp/ACME:Alice?issuer=ACME&secret=US3WHSG7X5KAPV27VANWKQHF3SH3HULL&algorithm=SHA1&digits=6&period=30`

// Convert from Google Authenticator key URI format.
// totp = OTPAuth.URI.parse(uri);
