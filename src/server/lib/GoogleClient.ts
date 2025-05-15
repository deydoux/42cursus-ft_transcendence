export default class GoogleClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private fetch = async <T>(url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const body = await response.json();
    if (!response.ok) throw body;
    return body as T;
  };

  getUserInfo = () =>
    this.fetch<GoogleUserInfo>('https://www.googleapis.com/oauth2/v3/userinfo');
}
