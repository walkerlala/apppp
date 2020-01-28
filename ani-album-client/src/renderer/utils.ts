import { Vector } from '@josh-brown/vector';

export function removeElement(element: HTMLElement) {
  element.parentElement.removeChild(element);
}

export function turnInvisible(element: HTMLElement) {
  element.style.visibility = 'hidden';
}

export function turnVisible(element: HTMLElement) {
  element.style.visibility = 'visible';
}

export function setImageSize(element: HTMLImageElement, size: Vector<number>) {
  const width = size.getEntry(0);
  const height = size.getEntry(1);
  element.style.width = width + 'px';
  element.style.height = height + 'px';
}
