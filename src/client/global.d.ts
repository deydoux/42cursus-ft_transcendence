export {};

declare global {
  interface Window {
    googleSignup: (response: {credential: string}) => void;
  }
}
