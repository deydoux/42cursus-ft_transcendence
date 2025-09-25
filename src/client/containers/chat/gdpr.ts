import {createDialog} from '../../components/Dialog';
import {createElement} from '../../utils/dom';

export const gdpr = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ac eros eu nisi facilisis commodo. Morbi molestie sit amet ligula sed pulvinar. Nunc at maximus enim. Nullam mollis imperdiet erat, eu mollis ante venenatis in. Phasellus auctor, massa quis scelerisque elementum, nisl purus venenatis lorem, dapibus mattis eros ex in lorem. Integer sed interdum ex. Curabitur tempor mi eget volutpat sodales. Morbi eu dapibus sem, vel scelerisque augue. Nulla facilisi. Quisque at nunc neque. Morbi blandit, elit in mollis laoreet, sapien nunc euismod est, efficitur eleifend ante turpis eleifend neque. Pellentesque mollis ut tortor id posuere. Duis posuere dignissim ante non porta. Donec felis lectus, auctor sollicitudin nisl non, scelerisque fermentum orci.'`;

export const renderGDPR = () => {
  const {dialogContent, showModal} = createDialog('gdpr');

  dialogContent.className = `p-10 bg-background text-white border border-white/50 rounded-xl flex flex-col max-h-[90%]`;
  dialogContent.appendChild(
    createElement('h1', {
      textContent: 'Privacy Policy',
      className: 'text-2xl font-bold flex-none',
    }),
  );

  dialogContent.appendChild(
    createElement('p', {
      className: 'max-w-100 max-h-200 mt-6 flex-1 overflow-y-auto',
      textContent: gdpr,
    }),
  );

  const gdprButton = createElement('div', {
    className: 'text-xs -mt-1 text-center text-white/50',
    textContent: 'Take a look at our ',
  });
  gdprButton.appendChild(
    createElement('span', {
      className: 'cursor-pointer hover:text-pink-300',
      textContent: 'Privacy Policy',
      onclick: showModal,
    }),
  );

  return gdprButton;
};
