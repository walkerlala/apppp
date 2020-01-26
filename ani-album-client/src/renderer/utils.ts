export interface Size {
  width: number;
  height: number;
}

export function removeElement(element: HTMLElement) {
  element.parentElement.removeChild(element);
}

export function turnInvisible(element: HTMLElement) {
  element.style.visibility = 'hidden';
}

export function turnVisible(element: HTMLElement) {
  element.style.visibility = 'visible';
}

export function setImageSize(element: HTMLImageElement, size: Size) {
  const { width, height } = size;
  element.style.width = width + 'px';
  element.style.height = height + 'px';
}
