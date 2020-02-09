import { useEffect } from 'react';
import createFocusTrap from 'focus-trap';
import { FocusManagerHook } from './types';
import { noop } from 'lodash';

export const useFocusManager = ({
  popupRef,
  initialFocusRef,
}: FocusManagerHook): void => {
  useEffect(() => {
    if (!popupRef) {
      return noop;
    }

    const trapConfig = {
      clickOutsideDeactivates: true,
      escapeDeactivates: true,
      initialFocus: initialFocusRef || popupRef,
      fallbackFocus: popupRef,
      returnFocusOnDeactivate: true,
    };

    const focusTrap = createFocusTrap(popupRef, trapConfig);
    focusTrap.activate();

    return () => {
      focusTrap.deactivate();
    };
  }, [popupRef, initialFocusRef]);
};
