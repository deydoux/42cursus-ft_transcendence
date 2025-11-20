import {Api} from '../utils/Api';
import {Router} from '../services/router';
import {Socket} from '../services/websocket';
import {Toastify} from '../utils/toastify';

const api = Api.getInstance();
const websocket = Socket.getInstance();

export const logout = async (redirect = true) => {
  const router = Router.getInstance();

  try {
    const response = await api.post('auth/logout', {});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    localStorage.removeItem('accessToken');
    websocket.disconnect();
    if (redirect) router.navigate('/');
  } catch (error) {
    Toastify.error('An error occurred while fetching user account');
    console.error(error);
  }
};

export const verifyTOTP = async (
  token: string,
  totpAccessToken: string,
  errorMessage: HTMLElement,
) => {
  const router = Router.getInstance();

  try {
    const response = await api.post(
      'auth/verify',
      {token},
      {
        headers: {
          Authorization: `Bearer ${totpAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    api.setAccessToken(data.accessToken);

    await websocket.connect();
    router.navigate('/homepage');
  } catch (error) {
    errorMessage.textContent = error.message;
    console.error(error);
  }
};

export const register = async (
  endpoint: string,
  body: Record<string, FormDataEntryValue>,
) => {
  try {
    if (endpoint === 'signup' && body.password !== body.confirmPassword) {
      throw new Error('The two passwords are not matching');
    }

    const response = await api.post(`auth/${endpoint}`, body);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();

    if (data.totp) return {success: true, totp: data.accessToken};

    api.setAccessToken(data.accessToken);

    await websocket.connect();
    return {success: true};
  } catch (error) {
    return {success: false, message: error.message};
  }
};
