import styled from 'styled-components';

export interface ContainerProps {
  show: boolean;
}

export const Container = styled.div`
  display: ${(props: ContainerProps) => props.show ? 'block' : 'none'};
  padding-top: 24px;
  padding-right: 36px;
  padding-left: 24px;
  flex-grow: 1;
`;
