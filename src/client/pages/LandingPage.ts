import '../styles/landing-page.css';
import {addFormListener} from '../utils/form';
import {renderSigninForm} from '../containers/signinForm';
import {renderSignupForm} from '../containers/signupForm';
import {welcome_emojies} from '../utils/content';

const change_emoji = () => {
  const emoji_span = document.getElementById('emoji');
  if (!emoji_span) return;

  const array = welcome_emojies.filter(e => e !== emoji_span.textContent);
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

  addFormListener('signin', 'auth/login', ['username', 'password']);
  addFormListener('signup', 'auth/signup', ['username', 'password']);
};
