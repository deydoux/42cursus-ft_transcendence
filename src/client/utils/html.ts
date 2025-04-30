export function html<T extends HTMLElement = HTMLDivElement>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): T {
  const template = document.createElement('template');
  //values = values.map((value: string) =>
  //  value
  //    .replace(/&/g, '&amp;')
  //    .replace(/</g, '&lt;')
  //    .replace(/>/g, '&gt;')
  //    .replace(/"/g, '&quot;')
  //    .replace(/'/g, '&#39;'),
  //);
  template.innerHTML = String.raw(strings, ...values).trim();
  return template.content.firstElementChild as T;
}
