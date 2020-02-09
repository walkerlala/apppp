import { N0, N50A, N60A } from '@atlaskit/theme/colors';
import { borderRadius, layers } from '@atlaskit/theme/constants';
import styled from 'styled-components';

const e200 = `0 4px 8px -2px ${N50A}, 0 0 1px ${N60A};`;

export const PopupContainer = styled.div`
  background-color: ${N0};
  border-radius: ${borderRadius()}px;
  box-shadow: ${e200};
  box-sizing: border-box;
  display: block;
  flex: 1 1 auto;
  overflow: auto;
  z-index: ${layers.layer()};

  &:focus {
    outline: none;
  }
`;

export const popupCSS = {
  backgroundColor: N0,
  borderRadius: `${borderRadius()}px`,
  boxShadow: e200,
  boxSizing: 'border-box',
  display: 'block',
  flex: '1 1 auto',
  overflow: 'auto',
  zIndex: layers.layer(),
  ':focus': {
    outline: 'none',
  },
} as const;

export const containerCSS = {
  position: 'relative',
} as const;
