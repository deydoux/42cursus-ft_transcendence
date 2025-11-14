import {Api} from '../utils/Api';
import {Result} from '../types/api';
import {Toastify} from '../utils/toastify';
import {downloadResponse} from '../utils/string';

const api = Api.getInstance();

export const fetchPublicKPIs = async () => {
  try {
    const response = await api.get('kpi');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    api.store.setState({publicKPIs: data});
  } catch (error) {
    Toastify.error("Could not fetch public kpi's");
    console.error(error);
  }
};

export const fetchAccount = async () => {
  try {
    const response = await api.get('account');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data: {
      id: number;
      username: string;
      passwordEditedAt: string;
      totp: boolean;
      elo: {
        pong: number;
        race: number;
      };
      hasAvatar: boolean;
      avatar: string;
    } = await response.json();
    api.store.setState({
      user: {
        ...data,
        elo: data.elo.pong,
        raceElo: data.elo.race,
      },
    });
    return true;
  } catch (error) {
    Toastify.error('An error occurred while fetching user account');
    console.error(error);
    return false;
  }
};

export const fetchSessions = async () => {
  try {
    const response = await api.get('account/sessions');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    api.store.setState({sessions: data});
  } catch (error) {
    Toastify.error('An error occurred while fetching the user sessions');
    console.error(error);
  }
};

export const downloadData = async () => {
  try {
    const response = await api.get('account/dump');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const {user} = api.store.getState();
    if (!user) throw new Error('User is undefined');
    downloadResponse(`KittyPong-${user.username}-data.json`, response);
  } catch (error) {
    Toastify.error('An error occured while downloading data');
    console.error(error);
  }
};

export const generateTotp = async (): Promise<Result<{uri: string}>> => {
  try {
    const response = await api.get('account/totp');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    api.store.setState({totpCode: data});
    return {success: true, data: data};
  } catch (error) {
    Toastify.error('Could not generate 2 factor authentication code');
    console.error(error);
    return {success: false, error};
  }
};

export const updateAvatar = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file, file.name);

    const accessToken = localStorage.getItem('accessToken');
    const response = await api.customFetch('/api/account/avatar', {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    await fetchAccount();
    Toastify.success('Avatar updated successfully');
  } catch (error) {
    Toastify.error('An error occurred while uploading the avatar');
    console.error(error);
  }
};

export const updateUsername = async (
  username: string,
): Promise<Result<void>> => {
  try {
    const response = await api.patch('account', {username});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    await fetchAccount();
    Toastify.success('Username updated successfully');
    return {success: true, data: undefined};
  } catch (error) {
    return {success: false, error: error.toString()};
  }
};

export const updatePassword = async (
  oldPassword: string,
  password: string,
): Promise<Result<void>> => {
  try {
    const response = await api.patch('account', {
      oldPassword,
      password,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    await fetchAccount();
    Toastify.success('Password updated successfully');
    return {success: true, data: undefined};
  } catch (error) {
    console.error(error);
    return {success: false, error};
  }
};

export const confirmTotp = async (
  secretToken: string,
): Promise<Result<void>> => {
  try {
    const response = await api.put('account/totp', {
      token: secretToken,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    fetchAccount();
    Toastify.success('2 factor authentication activated');
    return {success: true, data: undefined};
  } catch (error) {
    console.error(error);
    return {success: false, error};
  }
};

export const deleteAccount = async (
  password: string,
): Promise<Result<void>> => {
  try {
    const response = await api.delete('account', {password});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    Toastify.success('Account deleted successfully');
    return {success: true, data: undefined};
  } catch (error) {
    console.error(error);
    return {success: false, error};
  }
};

export const removeAvatar = async () => {
  try {
    const response = await api.delete('account/avatar', {});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    await fetchAccount();
    Toastify.success('Avatar removed successfully');
  } catch (error) {
    Toastify.error('An error occurred while removing the avatar');
    console.error(error);
  }
};

export const disconnectSession = async (sessionID?: number) => {
  try {
    const response = await api.delete(
      sessionID ? `account/sessions/${sessionID}` : 'account/sessions',
      {},
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    fetchSessions();
    Toastify.success(
      `Session${sessionID ? '' : 's'} disconnected successfully`,
    );
  } catch (error) {
    Toastify.error('An error occurred while fetching the user sessions');
    console.error(error);
  }
};

export const removeTotp = async (
  secretToken: string,
): Promise<Result<void>> => {
  try {
    const response = await api.delete('account/totp', {
      token: secretToken,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    fetchAccount();
    Toastify.success('2 Factor Authentication deactivated');
    return {success: true, data: undefined};
  } catch (error) {
    console.error(error);
    return {success: false, error};
  }
};
