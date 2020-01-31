import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  margin-right: 36px;
  height: 32px;
  align-items: center;
  border-radius: 4px;
  padding-left: 8px;
  padding-right: 8px;

  &:hover {
    background-color: rgb(246, 246, 246);
    cursor: pointer;
  }
`;

export const LogoContainer = styled.div`
  margin-right: 8px;
`;

export const Text = styled.div`
  font-size: 16px;
  color: #5a5a5a;
`;
