import {Api} from '../utils/Api';
import {Toastify} from '../utils/toastify';

const api = Api.getInstance();

export const fetchUserProfile = async (userID: number) => {
  try {
    const response = await api.get(`users/${userID}/profile`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    Toastify.error('Could not fetch user profile');
    console.error(error);
  }
};
