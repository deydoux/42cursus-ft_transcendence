class Api {
  public async get(endpoint: string) {
    return fetch('/api/' + endpoint, {
      method: 'GET',
    }).then(answer => {
      if (answer.ok) return answer;
      throw answer;
    });
  }

  public async post(endpoint: string, body: object) {
    const strBody = JSON.stringify(body);
    return fetch('/api/' + endpoint, {
      method: 'POST',
      body: strBody,
      headers: {
        'content-type': 'application/json',
      },
    }).then(answer => {
      if (answer.ok) return answer;
      throw answer;
    });
  }
}

export const api = new Api();
