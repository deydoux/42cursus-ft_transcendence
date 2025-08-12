import {DOMUtils} from '../utils/dom';

export const createOTPInput = (nbInputs = 6) => {
  const form = DOMUtils.createElement('form');
  const inputs: HTMLInputElement[] = [];

  [...Array(nbInputs)].forEach((_, i) => {
    console.log(i, i % 3 === 0);
    const input = DOMUtils.createElement('input', {
      className: `w-8 h-8 transition-none text-center text-white border border-pink-300/50 focus:border-white transition-border duration-200 focus:outline-none rounded ${i % 3 === 2 ? 'mr-4' : 'mr-2'}`,
      attributes: {
        name: `otp-${i}`,
      },
    });

    form.appendChild(input);
    inputs.push(input);
  });

  inputs.forEach((input, i) => {
    input.addEventListener('keydown', event => {
      if (event.key === 'Backspace') {
        input.value = '';
        if (i !== 0) inputs[i - 1].focus();
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        // Let the paste event handle the logic
        return;
      } else {
        if (
          i === inputs.length - 1 &&
          input.value !== '' &&
          /^[a-zA-Z0-9]$/.test(event.key)
        ) {
          input.value = event.key;
          event.preventDefault();
        } else if (/^[a-zA-Z0-9]$/.test(event.key)) {
          input.value = event.key;
          if (i !== inputs.length - 1) inputs[i + 1].focus();
          event.preventDefault();
        }
      }
    });

    input.addEventListener('paste', event => {
      console.log('herer');
      event.preventDefault();
      const pasteData = event.clipboardData?.getData('text') ?? '';
      const cleanData = pasteData.replace(/\s/g, '');

      // Fill inputs starting from current position
      for (let j = 0; j < cleanData.length && j < inputs.length; j++) {
        if (/^[a-zA-Z0-9]$/.test(cleanData[j])) {
          inputs[i + j].value = cleanData[j];
        }
      }

      // Focus on the next empty input or the last input
      const nextIndex = Math.min(i + cleanData.length, inputs.length - 1);
      inputs[nextIndex].focus();
    });
  });

  const getValue = () => {
    return inputs.map(input => input.value).join('');
  };

  return {form, inputs, getValue};
};
