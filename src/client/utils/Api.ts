class Api {
  public async get(endpoint: string) {
    const response = await fetch('/api/' + endpoint, {
      method: 'GET',
    });

    if (response.status !== 204) response.json = await response.json();

    if (response.ok) return response;
    throw response;
  }

  public async post(endpoint: string, body: object) {
    const response = await fetch('/api/' + endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    });

    if (response.status !== 204) response.json = await response.json();

    if (response.ok) return response;
    throw response;
  }
}

export const api = new Api();
