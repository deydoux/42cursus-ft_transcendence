import {Api} from '../utils/Api';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';

const api = Api.getInstance();

export const fetchTournaments = async () => {
  const store = Store.getInstance();

  try {
    const response = await api.get('tournaments');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    store.setState({tournaments: data});
  } catch (error) {
    Toastify.error('Could not fetch tournaments');
    console.error(error);
  }
};
