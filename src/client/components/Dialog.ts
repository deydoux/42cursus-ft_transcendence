import { DOMUtils } from "../utils/dom";

export const createDialog = (id: string) => {
  const dialog = DOMUtils.createElement('dialog', {
    className: "max-w-[100vw] max-h-[100vh] w-screen h-screen bg-black/10 backdrop-blur-sm",
    attributes: { 
      id: id 
    },
  }) as HTMLDialogElement;

  document.getElementById('root')?.appendChild(dialog);
  const showModal = () => dialog.showModal();
  const close = () => dialog.close();

  const dialogWrapper = DOMUtils.createElement('div', {
    className: 'w-full h-full flex items-center justify-center',
    events: {
      click: (evt) => close()
    }
  });

  const dialogContent = DOMUtils.createElement('div', {
    events: {
      click: (evt) => evt.stopPropagation()
    }
  });

  dialogWrapper.appendChild(dialogContent);
  dialog.appendChild(dialogWrapper);

  return { dialog, dialogContent, showModal, close };
}
