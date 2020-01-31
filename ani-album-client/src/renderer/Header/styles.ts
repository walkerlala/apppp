import styled from 'styled-components';

export const HeaderContainer = styled.div`
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
  padding-top: 8px;;
  height: 40px;
`;

export const BigHeadingTitle = styled.div`
  display: flex;

  font-size: 24px;
  line-height: 40px;
  font-weight: 500;
  padding-left: 24px;
`;

export const ScaleToFitButton = styled.button`
  height: 32px;

  padding: 4px;
  margin-left: 12px;

  &:hover {
    cursor: pointer;
  }
`;

export const HeaderButtonGroup = styled.div`
  margin-left: auto;

  padding-right: 36px;

  height: 100%;
  display: flex;
  align-items: center;

  -webkit-app-region: no-drag;
`;

export const EditableTitleContainer = styled.div`
  input.ani-input {
    border: none;
    font-size: 24px;
    font-weight: 500;
    
    &:focus {
      outline: none;
    }
  }
`;

export const SearchHeaderContainer = styled(HeaderContainer)`
  padding-left: 24px;
  padding-right: 36px;
  display: flex;
  align-items: center;
`;

export const SearchInputContainer = styled.div`
  flex-grow: 1;
`;

export const SearchCloseButton = styled.div`
  height: 32px;
  font-size: 16px;
  color: #5a5a5a;
  padding-left: 8px;
  padding-right: 8px;
  line-height: 32px;

  -webkit-app-region: no-drag;
`;
