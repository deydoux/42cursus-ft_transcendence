import {BaseComponent} from '../../components/BaseComponent';
import {createElement} from '../../utils/dom';
import {updatePassword} from '../../api/account';

export class PasswordManager extends BaseComponent {
  render() {
    const container = createElement('form', {
      className: 'flex flex-col',
      events: {
        submit: async evt => {
          evt.preventDefault();
          const formData = new FormData(evt.target as HTMLFormElement);
          const formDataObj = {
            oldpassword: '',
            newpassword: '',
            newpasswordagain: '',
          };
          formData.forEach((value, key) => (formDataObj[key] = value));

          const errorField = document.querySelector(
            'p#password-error-message',
          ) as HTMLParagraphElement;
          errorField.textContent = '';
          if (formDataObj.newpassword !== formDataObj.newpasswordagain) {
            errorField.textContent = 'The two passwords must be the same';
            return;
          }

          const result = await updatePassword(
            formDataObj.oldpassword,
            formDataObj.newpassword,
          );
          if (result.success) {
            document
              .querySelectorAll('input.change-password')
              .forEach(input => ((input as HTMLInputElement).value = ''));
            const button = document.querySelector(
              'button#change-password',
            ) as HTMLButtonElement;
            button.disabled = true;
          } else {
            errorField.textContent = result.error
              .toString()
              .replace(/^Error: /, '');
          }
        },
      },
    });

    const checkInputs = () => {
      const allFilled = [
        ...document.querySelectorAll('input.change-password'),
      ].every(i => (i as HTMLInputElement).value);
      console.log(
        'allFiled',
        document.querySelectorAll('input.change-password'),
      );
      const saveButton = document.querySelector(
        'button#change-password',
      ) as HTMLButtonElement;
      console.log('saveButton', saveButton);
      if (saveButton) saveButton.disabled = !allFilled;
    };

    const passwordsWrapper = createElement('div', {
      className: 'w-full flex items-center gap-4 pt-4',
    });

    ['Old Password', 'New Password', 'New Password Again'].forEach(label => {
      const password = createElement('div', {
        className: 'flex-1',
      });
      password.appendChild(
        createElement('label', {
          className: 'font-semibold mb-1 text-sm',
          textContent: label,
        }),
      );
      password.appendChild(
        createElement('input', {
          className: `change-password mt-1 border w-full border-pink-300/50 bg-background focus:border-white rounded-lg focus:outline-none px-3 py-2 placeholder:font-light placeholder:text-white/20`,
          attributes: {
            type: 'password',
            name: label.toLowerCase().replaceAll(' ', ''),
            placeholder: 'Enter your password',
          },
          events: {
            input: () => checkInputs(),
          },
        }),
      );

      passwordsWrapper.appendChild(password);
    });
    container.appendChild(passwordsWrapper);

    const submitWrapper = createElement('div', {
      className: 'mt-4 w-full flex items-start justify-end gap-4',
    });
    submitWrapper.appendChild(
      createElement('p', {
        className: `text-red-500 font-light text-sm max-w-[400px] text-right leading-tight flex mt-0.5`,
        attributes: {
          id: 'password-error-message',
        },
      }),
    );
    submitWrapper.appendChild(
      createElement('button', {
        textContent: 'Save New Password',
        className: `flex-none border border-pink-300 text-sm rounded-lg h-full px-4 py-2 bg-pink-300/20 duration-200 cursor-pointer disabled:text-white/50 disabled:border-white/30 disabled:bg-background disabled:cursor-default`,
        attributes: {
          id: 'change-password',
          disabled: 'true',
          type: 'submit',
        },
      }),
    );

    container.appendChild(submitWrapper);
    return container;
  }
}
