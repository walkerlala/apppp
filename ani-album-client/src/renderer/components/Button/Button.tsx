import * as React from 'react';
import './Button.scss';

export type ButtonSize = 'large' | 'medium' | 'small';

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  size?: ButtonSize,
  forwardRef?: React.Ref<HTMLButtonElement>,
};

class ButtonBase extends React.Component<ButtonProps> {

  static defaultProps: Partial<ButtonProps> = {
    size: 'medium',
  }

  render() {
    const { className = '', forwardRef, size, ...rest } = this.props;
    const newClassName = `${className} ani-std-button ani-button-${size}`;
    return (
      <button
        ref={forwardRef}
        className={newClassName}
        {...rest}
      />
    );
  }

}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => 
  <ButtonBase forwardRef={ref} {...props} />
);

export default Button;
