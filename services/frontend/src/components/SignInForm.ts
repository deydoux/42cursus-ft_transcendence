export function createSignInForm(): HTMLFormElement {
  const form = document.createElement('form');
  form.className = 'signin-form';

  const title = document.createElement('h2');
  title.textContent = 'Sign In';

  const emailLabel = document.createElement('label');
  emailLabel.setAttribute('for', 'email');
  emailLabel.textContent = 'Email:';

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.name = 'email';

  const passwordLabel = document.createElement('label');
  passwordLabel.setAttribute('for', 'password');
  passwordLabel.textContent = 'Password:';

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.name = 'password';

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Sign In';

  form.append(
    title,
    emailLabel,
    emailInput,
    passwordLabel,
    passwordInput,
    submitButton,
  );

  form.addEventListener('submit', e => {
    e.preventDefault();
    console.log('Email:', emailInput.value);
    console.log('Password:', passwordInput.value);
  });

  return form;
}
