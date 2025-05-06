import {TOTP} from 'otpauth';

const totp = new TOTP({
  issuer: 'ft_transcendence',
  label: 'deydoux',
});

const uri = totp.toString();

console.log(uri);
console.log(totp.secret.base32);

const token = totp.generate();
console.log(token);

setTimeout(() => {
  const delta = totp.validate({token});
  console.log(delta);
}, 5000);
