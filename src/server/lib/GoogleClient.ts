export default class GoogleClient {
  private accessToken;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private fetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const body = await response.json();
    if (!response.ok) throw body;
    return body;
  };

  getUserInfo = () =>
    this.fetch('https://www.googleapis.com/oauth2/v3/userinfo');
}
