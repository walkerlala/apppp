import styled from 'styled-components';

export const MenuContainer = styled.div`
  min-width: 120px;
  width: 120px;
  border-radius: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
  box-shadow: 0px 0px 8px 2px rgba(0, 0, 0, 0.2);
  background-color: white;
`;

export const MenuItemContainer = styled.div`
  display: flex;
  align-items: center;
  min-height: 32px;
  height: 32px;
  padding-left: 12px;
  padding-right: 12px;
  font-size: 14px;
  color: #5A5A5A;

  &:hover {
    background-color: #e8e7e4;
  }
`;
