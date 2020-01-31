import styled from 'styled-components';

export const SearchInputContainer = styled.div`
  height: 100%;;
  display: flex;
`;

export const LogoContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

export const Input = styled.input`
  border: none;
  margin-left: 12px;
  font-size: 16px;
  color: #5a5a5a;

  &:focus {
    outline: none;
  }
`;
