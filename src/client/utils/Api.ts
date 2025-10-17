import {Router} from '../services/router';
import {Store} from '../services/store';
import {Toastify} from './toastify';

const publicEndpoints = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify',
];

export class Api {
  private unauthorizedRedirect = '/';
  private static instance: Api;
  private refreshPromise: Promise<string> | null = null;

  public store = Store.getInstance();

  static getInstance(): Api {
    if (!Api.instance) Api.instance = new Api();
    return Api.instance;
  }

  public setAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  private getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
        });

        if (!refreshResponse.ok) {
          if (location.pathname !== this.unauthorizedRedirect) {
            Router.getInstance().navigate(this.unauthorizedRedirect);
            Toastify.dismissAll();
            Toastify.error("You've been disconnected");
          }
          throw new Error('Refresh failed');
        }

        const body = await refreshResponse.json();
        this.setAccessToken(body.accessToken);
        return body.accessToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async customFetch(
    input: string | URL | globalThis.Request,
    init?: RequestInit,
  ): Promise<Response> {
    try {
      const requestInit = {
        ...init,
        headers: {...init?.headers},
      } as RequestInit;
      const accessToken = this.getAccessToken();
      if (accessToken && !publicEndpoints.includes(input.toString())) {
        requestInit.headers = {
          ...requestInit.headers,
          authorization: `Bearer ${accessToken}`,
        };
      }

      const response = await fetch(input, requestInit);

      if (
        response.status === 401 &&
        !publicEndpoints.includes(input.toString())
      ) {
        const newAccessToken = await this.refreshAccessToken();

        return fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      return response;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  public async get(endpoint: string, init?: RequestInit) {
    return this.customFetch('/api/' + endpoint, {
      method: 'GET',
      ...init,
    });
  }

  public async post(
    endpoint: string,
    body: object,
    init?: RequestInit,
  ): Promise<Response> {
    return this.customFetch('/api/' + endpoint, {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(init && init.headers ? init.headers : {}),
      },
      ...init,
    });
  }

  public async patch(
    endpoint: string,
    body: object,
    init?: RequestInit,
  ): Promise<Response> {
    return this.customFetch('/api/' + endpoint, {
      body: JSON.stringify(body),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(init && init.headers ? init.headers : {}),
      },
      ...init,
    });
  }

  public async put(
    endpoint: string,
    body: object,
    init?: RequestInit,
  ): Promise<Response> {
    return this.customFetch('/api/' + endpoint, {
      body: JSON.stringify(body),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(init && init.headers ? init.headers : {}),
      },
      ...init,
    });
  }

  public async delete(
    endpoint: string,
    body: object,
    init?: RequestInit,
  ): Promise<Response> {
    return this.customFetch('/api/' + endpoint, {
      body: JSON.stringify(body),
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(init && init.headers ? init.headers : {}),
      },
      ...init,
    });
  }
}
