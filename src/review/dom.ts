export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  ...children: (string | Node)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  element.append(...children);
  return element;
}
