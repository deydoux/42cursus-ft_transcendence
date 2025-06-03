import {api} from './Api';
import {renderFormErrorBox} from '../components/formErrorBox';

const formErrorBoxClassList = ['max-h-17', 'opacity-100', 'mb-4'];

const submitForm = (
  form: HTMLFormElement,
  apiEndpoint: string,
  fields: string[],
  onSuccess: Function,
) => {
  const body = {};
  fields.forEach(field => {
    body[field] = (form.querySelector('#' + field) as HTMLInputElement)?.value;
  });

  api
    .post(apiEndpoint, body)
    .then(answer => {
      onSuccess(answer);
      return answer.json;
    })
    .catch(async error => {
      const formErrorBox = form.querySelector('#form-error-box');
      if (!formErrorBox) return;

      const body = await error.json;

      const label = formErrorBox.querySelector('#error-label');
      if (label) label.textContent = body.message;

      formErrorBoxClassList.forEach(classAttr =>
        formErrorBox.classList.add(classAttr),
      );

      fields.forEach(field => {
        form.querySelector('#' + field)?.classList.add('border-error');
      });
    });
};

export const addFormListener = (
  formName: string,
  apiEndpoint: string,
  fields: string[],
  onSuccess: Function,
  errorLabelExtra?: HTMLElement,
) => {
  const form = document.getElementById(formName + '-form') as HTMLFormElement;
  if (!form) return;

  form.insertBefore(renderFormErrorBox(errorLabelExtra), form.firstChild);
  fields.forEach(field => {
    (form.querySelector('#' + field) as HTMLInputElement)?.addEventListener(
      'keydown',
      (evt: KeyboardEvent) => {
        if (evt.key === 'Enter') submitForm(form, apiEndpoint, fields, onSuccess);
      },
    );
  });

  form?.addEventListener('submit', evt => {
    evt.preventDefault();
    submitForm(form, apiEndpoint, fields, onSuccess);
  });

  form.querySelector('#close-error-box')?.addEventListener('click', evt => {
    evt.preventDefault();

    const formErrorBox = form.querySelector('#form-error-box');
    if (!formErrorBox) return;

    formErrorBoxClassList.forEach(classAttr =>
      formErrorBox.classList.remove(classAttr),
    );

    fields.forEach(field => {
      form.querySelector('#' + field)?.classList.remove('border-error');
    });
  });
};
