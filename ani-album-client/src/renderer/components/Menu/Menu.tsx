import * as React from 'react';
import { MenuContainer } from './styles';
import MenuItem from './MenuItem';

export interface MenuProps {
  children?: MenuItem[];
  forwardRef?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
}

class MenuBase extends React.Component<MenuProps> {

  render() {
    const { style, children, forwardRef } = this.props;
    return (
      <MenuContainer className="noselect" ref={forwardRef} style={style}>
        {children}
      </MenuContainer>
    );
  }

}

const Menu = React.forwardRef<HTMLDivElement, MenuProps>((props: MenuProps, ref: React.Ref<HTMLDivElement>) => 
  <MenuBase forwardRef={ref} {...props} />
);

export default Menu;
