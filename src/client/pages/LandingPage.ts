import '../styles/landing-page.css';
import {addFormListener} from '../utils/form';
import {html} from '../utils/html';
import {renderSigninForm} from '../containers/signinForm';
import {renderSignupForm} from '../containers/signupForm';
import {welcomeEmojis} from '../utils/content';
import {api} from '../utils/Api';
import {navigate} from '../utils/navigate';

const change_emoji = () => {
  const emoji_span = document.getElementById('emoji');
  if (!emoji_span) return;

  const array = welcomeEmojis.filter(e => e !== emoji_span.textContent);
  const random_emoji = array[Math.floor(Math.random() * array.length)];

  emoji_span.classList.add('scale-110');
  setTimeout(() => emoji_span.classList.remove('scale-110'), 200);

  emoji_span.textContent = random_emoji;
};

export const renderLandingPage = (path: string): void => {
  const right = document.getElementById('right-container');
  const left = document.getElementById('left-container');
  if (!(right && left))
    return console.error('Could not find right and left containers');

  left.className = 'flex-1 bg-image scale-x-[-1] h-full rounded-[30px] border';
  right.className =
    'w-[550px] flex-none h-full flex items-center justify-center border p-10 py-15 rounded-[30px] backdrop-blur-lg';

  if (path === '/signin' || path === '/') right.appendChild(renderSigninForm());
  else if (path === '/signup') right.appendChild(renderSignupForm());

  const container = document.getElementById('right-container');
  if (container) container.addEventListener('mouseenter', change_emoji, false);

  const emojiSpan = document.getElementById('emoji');
  if (emojiSpan) emojiSpan.addEventListener('click', change_emoji, false);

  const signUpLink = html`<div>
    <span>Have you already</span>
    <a class="text-md cursor-pointer font-bold hover:underline" href="signup">
      signed up
    </a>
    <span>?</span>
  </div>`;

  const enterApp = (response: any) => {
    api.storeAccessToken(response?.json.accessToken);
    navigate('Home', '/homepage');
  };

  addFormListener(
    'signin',
    'auth/login',
    ['username', 'password'],
    enterApp,
    signUpLink,
  );
  addFormListener('signup', 'auth/signup', ['username', 'password'], enterApp);
};
