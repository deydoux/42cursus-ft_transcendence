const publicEndpoints = ['/api/auth/login', '/api/auth/signup'];

class Api {
  public setAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  private getAccessToken() {
    return localStorage.getItem('accessToken');
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
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
        });

        if (!refreshResponse.ok) {
          // Redirect to landing page
          throw refreshResponse;
        }

        const body = await refreshResponse.json();
        this.setAccessToken(body.accessToken);

        return fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            authorization: `Bearer ${body.accessToken}`,
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
}

export const api = new Api();
