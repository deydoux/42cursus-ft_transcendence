const publicEndpoints = ['/api/auth/login', '/api/auth/signup'];

class Api {
  public setAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  private getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  private async customFetch(
    input: string | URL | globalThis.Request,
    init?: RequestInit,
  ) : Promise<Response> {
    try {
      let requestInit = { ...init, headers: { ...init?.headers, 'Content-Type': 'application/json' } } as RequestInit;
      const accessToken = this.getAccessToken();
      if (accessToken && !publicEndpoints.includes(input.toString())) {
        requestInit.headers = {
          ...requestInit.headers,
          authorization: `Bearer ${accessToken}`
        }
      }
      
      const response = await fetch(input, requestInit);

      if (
        response.status === 401 && 
        !publicEndpoints.includes(input.toString())
      ) {
        const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });
      
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
            'Content-Type': 'application/json',
            authorization: `Bearer ${body.accessToken}`
          },
        });
      }

      return response;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  public async get(endpoint: string) {
    return this.customFetch('/api/' + endpoint, {
      method: 'GET',
    });
  }

  public async post(endpoint: string, body: object) : Promise<Response> {
    return this.customFetch('/api/' + endpoint, {
      body: JSON.stringify(body),
      method: 'POST',
    });
  }
}

export const api = new Api();
