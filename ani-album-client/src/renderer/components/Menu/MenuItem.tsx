import * as React from 'react';
import { MenuItemContainer } from './styles';

export interface MenuItemProps {
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactChildren | string;
}

class MenuItem extends React.Component<MenuItemProps> {

  render() {
    const { children, onClick } = this.props;
    return (
      <MenuItemContainer onClick={onClick}>
        {children}
      </MenuItemContainer>
    );
  }

}

export default MenuItem;
