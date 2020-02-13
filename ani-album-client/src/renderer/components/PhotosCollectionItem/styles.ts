import styled from 'styled-components';

export const Container = styled.div`
  padding-right: 32px;
  padding-top: 24px;

  &:hover {
    cursor: pointer;
  }
`;

export interface ThumbnailsContainerProps {
  isHover: boolean;
}

export const ThumbnailsContainer = styled.div`
  width: 160px;
  min-width: 160px;
  height: 160px;
  min-height: 160px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;

  display: flex;
  flex-flow: row wrap;

  position: relative;

  ${(props: ThumbnailsContainerProps) => props.isHover ?
    'box-shadow: 0px 0px 8px 2px rgba(0, 0, 0, 0.2);' : 
    ''
}
`;

export type LineDividerDirection = 'vertical' | 'horizontal';

export interface LineDividerProps {
  direction: LineDividerDirection;
}

export const LineDivider = styled.div`
  position: absolute;
  background-color: white;

  ${(props: LineDividerProps) => props.direction === 'vertical' ? `
    width: 100%;
    height: 2px;
    top: 50%;
    transform: translateY(-50%);
  ` : `
    height: 100%;
    width: 2px;
    left: 50%;
    transform: translateX(-50%);
  `}
`;

export const ThumbnailPadContainer = styled.div`
  background-color: #d4d4d4;
  width: 50%;
  min-width: 50%;
  height: 50%;
  min-height: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const TextContainer = styled.div`
  color: #5a5a5a;
  font-size: 12px;
  text-align: center;
  padding-top: 12px;
`;
