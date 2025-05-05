import {html} from '../utils/html';

export const renderAuthenticationInputs = () => {
  return html`
    <div class="w-full">
      <input
        class="auth-input mb-2"
        placeholder="Username"
        input-icon="user"
        id="username"
        type="text"
      />
      <input
        class="auth-input"
        placeholder="Password"
        autocomplete="on"
        input-icon="key"
        type="password"
        id="password"
      />
    </div>
  `;
};
