import {
  CSSProperties,
  Dispatch,
  FC,
  ReactNode,
  Ref,
  SetStateAction,
  ComponentType,
} from 'react';

import { Placement } from '@atlaskit/popper';

export type TriggerProps = {
  ref: Ref<HTMLElement>;
  'aria-controls'?: string;
  'aria-expanded': boolean;
  'aria-haspopup': boolean;
};

export type ContentProps = {
  scheduleUpdate(): void;
  isOpen: boolean;
  onClose: (() => void) | undefined;
  setInitialFocusRef: Dispatch<SetStateAction<HTMLElement | null>>;
};

export type PopupRef = HTMLDivElement | null;
export type TriggerRef = HTMLElement | null;

export type PopupComponentProps = {
  children: ReactNode;
  'data-placement': Placement;
  'data-testid'?: string;
  id?: string;
  ref: Ref<HTMLDivElement>;
  style: CSSProperties;
  tabIndex: number;
};

export type PopupProps = {
  /** Value passed to the Layer component to determine when to reposition the droplist */
  boundariesElement?: 'viewport' | 'window' | 'scrollParent';
  /** HTML Id for testing etc */
  id?: string;
  /** Formatted like "0, 8px" — how far to offset the Popper from the Reference. Changes automatically based on the placement */
  offset?: number | string;
  /** Positioning string of the Popup. See the documentation of @atlaskit/popper for more details. */
  placement?: Placement;
  /** Allows the Popup to be placed on the opposite side of its trigger if it does not
   * fit in the viewport. */
  shouldFlip?: boolean;
  /** testId maps to data-testid for testing in your application */
  testId?: string;
  /** Content to display in the Popup */
  content: ComponentType<ContentProps>;
  /** Callback function when the Popup is closed */
  onClose?(): void;
  /** Open State of the Dialog */
  isOpen: boolean;
  /** Component used to anchor the popup to your content. Usually a button used to open the popup */
  trigger: FC<TriggerProps>;
  /** The container displayed in the portal that wraps the content. Use to override the default white background with rounded corners */
  popupComponent?: ComponentType<PopupComponentProps>;
  /** Optional override for the z-index for the react portal */
  zIndex?: number;

  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
};

export type CloseManagerHook = Pick<PopupProps, 'isOpen' | 'onClose'> & {
  popupRef: PopupRef;
  triggerRef: TriggerRef;
};

export type FocusManagerHook = {
  popupRef: PopupRef;
  initialFocusRef: HTMLElement | null;
};

export type RepositionOnUpdateProps = {
  content: ComponentType<ContentProps>;
  scheduleUpdate(): void;
};

