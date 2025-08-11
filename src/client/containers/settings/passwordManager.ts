import {DOMUtils} from '../../utils/dom';
import {Toastify} from '../../utils/toastify';
import {api} from '../../utils/Api';

export class PasswordManager {
  private async updatePassword(
    oldPassword: string,
    password: string,
    confirmPassword: string,
    errorField: HTMLParagraphElement,
  ) {
    try {
      const response = await api.patch('account', {
        oldPassword,
        password,
        confirmPassword,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      document
        .querySelectorAll('input.change-password')
        .forEach(input => ((input as HTMLInputElement).value = ''));
      const button = document.querySelector(
        'button#change-password',
      ) as HTMLButtonElement;
      button.disabled = true;

      Toastify.success('Password updated successfully');
    } catch (error) {
      errorField.textContent = error.toString().replaceAll('Error: ', '');
      console.error(error);
    }
  }

  render() {
    const container = DOMUtils.createElement('form', {
      className: 'flex flex-col',
      events: {
        submit: evt => {
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

          this.updatePassword(
            formDataObj.oldpassword,
            formDataObj.newpassword,
            formDataObj.newpasswordagain,
            errorField,
          );
        },
      },
    });

    const checkInputs = () => {
      const allFilled = [
        ...document.querySelectorAll('input.change-password'),
      ].every(i => (i as HTMLInputElement).value);
      const saveButton = document.querySelector(
        'button#change-password',
      ) as HTMLButtonElement;
      if (saveButton) saveButton.disabled = !allFilled;
    };

    const passwordsWrapper = DOMUtils.createElement('div', {
      className: 'w-full flex items-center gap-4 pt-4',
    });

    ['Old Password', 'New Password', 'New Password Again'].forEach(label => {
      const password = DOMUtils.createElement('div', {
        className: 'flex-1',
      });
      password.appendChild(
        DOMUtils.createElement('label', {
          className: 'font-semibold mb-1 text-sm',
          textContent: label,
        }),
      );
      password.appendChild(
        DOMUtils.createElement('input', {
          className:
            'change-password mt-1 border w-full border-pink-300/50 bg-background focus:border-white rounded-lg focus:outline-none px-3 py-2 placeholder:font-light placeholder:text-white/20',
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

    const submitWrapper = DOMUtils.createElement('div', {
      className: 'mt-4 w-full flex items-start justify-end gap-4',
    });
    submitWrapper.appendChild(
      DOMUtils.createElement('p', {
        className:
          'text-red-500 font-light text-sm max-w-[400px] text-right leading-tight flex mt-0.5',
        attributes: {
          id: 'password-error-message',
        },
      }),
    );
    submitWrapper.appendChild(
      DOMUtils.createElement('button', {
        textContent: 'Save New Password',
        className:
          'flex-none border border-pink-300 text-sm rounded-lg h-full px-4 py-2 bg-pink-300/20 duration-200 cursor-pointer disabled:text-white/50 disabled:border-white/30 disabled:bg-background disabled:cursor-default',
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
