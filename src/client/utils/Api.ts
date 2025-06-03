import { navigate } from "./navigate";

const publicEndpoints = [
  '/api/auth/login',
  '/api/auth/signup'
]

class Api {
  private accessToken: string;
  private headers: HeadersInit;

  public storeAccessToken(token: string) {
    this.accessToken = token;
    this.headers = {
      Authorization: `Bearer ${this.accessToken}`,
    }
  }

  private async customFetch(input: string | URL | globalThis.Request, init?: RequestInit): Promise<void | Response> {
    return await fetch(input, init).then((response) => {
      if (response.status === 401 && !publicEndpoints.includes(input.toString())) {
        fetch('/api/auth/refresh', { method: 'POST' })
          .then(async (response) => {
            if (response.ok) {
              const body = await response.json();
              this.storeAccessToken(body.accessToken);
              fetch(input, { ...init, headers: { ...this.headers } });
            } else throw response;
          }).catch(() => {
            navigate('Se connecter', '/signin');
          });
      } else return response;
    })
  }

  public async get(endpoint: string) {
    const response = await this.customFetch('/api/' + endpoint, {
      headers: { ...(this.headers ?? {}) },
      method: 'GET'
    });

    if (response && response.status !== 204) response.json = await response.json();
    if (response && response.ok) return response;

    throw response;
  }

  public async post(endpoint: string, body: object) {
    const response = await this.customFetch('/api/' + endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        ...(this.headers ?? {})
      },
    });

    if (response && response.status !== 204) response.json = await response.json();
    if (response && response.ok) return response;

    throw response;
  }
}

export const api = new Api();
