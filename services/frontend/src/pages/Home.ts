export const Home = (): HTMLElement => {
  const div = document.createElement('div');
  div.innerHTML = `<h1>Welcome Home!</h1><a href="#/signin">Go to Sign In</a>`;
  return div;
};
