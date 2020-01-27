import NDArray from 'vectorious/index';

export function removeElement(element: HTMLElement) {
  element.parentElement.removeChild(element);
}

export function turnInvisible(element: HTMLElement) {
  element.style.visibility = 'hidden';
}

export function turnVisible(element: HTMLElement) {
  element.style.visibility = 'visible';
}

export function setImageSize(element: HTMLImageElement, size: NDArray) {
  const width = size.get(0);
  const height = size.get(1);
  element.style.width = width + 'px';
  element.style.height = height + 'px';
}

export function setImagePosition(element: HTMLElement, pos: NDArray) {
  const x = pos.get(1);
  const y = pos.get(1);
  element.style.top = y + 'px';
  element.style.left = x + 'px';
}
