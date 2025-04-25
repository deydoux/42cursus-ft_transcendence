import {renderSigninForm} from '../containers/signinForm';
import {renderSignupForm} from '../containers/signupForm';
import {welcome_emojies} from '../utils/content';
import '../styles/landing-page.css';
import {navigate} from '../utils/navigate';

const change_emoji = (): void => {
  const emoji_span = document.getElementById('emoji');
  if (!emoji_span) return;

  const array = welcome_emojies.filter(e => e !== emoji_span.textContent);
  const random_emoji = array[Math.floor(Math.random() * array.length)];

  emoji_span.classList.add('scale-110');
  setTimeout(() => emoji_span.classList.remove('scale-110'), 200);

  emoji_span.textContent = random_emoji;
};

setTimeout(() => {
  const container = document.getElementById('fg-container');
  if (container) container.addEventListener('mouseenter', change_emoji, false);

  const emojiSpan = document.getElementById('emoji');
  if (emojiSpan) emojiSpan.addEventListener('click', change_emoji, false);

  const signinButton = document.getElementById('signin-btn');
  if (signinButton)
    signinButton.addEventListener('click', () =>
      navigate('PongPong | Homepage', '/homepage'),
    );
}, 50);

export const renderLandingPage = (
  fgContainer: HTMLElement,
  bgContainer: HTMLElement,
  path: string,
): void => {
  bgContainer.className =
    'bg-image scale-x-[-1] w-2/3 mr-[15%] h-full rounded-[30px] border border-white';
  fgContainer.className =
    'w-[600px] h-[600px] flex items-center justify-center right-[10%] text-white absolute border p-10 py-15 rounded-[30px] backdrop-blur-lg';

  if (path === '/signin' || path === '/')
    fgContainer.appendChild(renderSigninForm());
  else if (path === '/signup') fgContainer.appendChild(renderSignupForm());
};
