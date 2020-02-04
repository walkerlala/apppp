import * as React from 'react';
import './Button.scss';

export type ButtonSize = 'large' | 'medium' | 'small';

export type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  size?: ButtonSize,
};

class Button extends React.Component<ButtonProps> {

  static defaultProps: Partial<ButtonProps> = {
    size: 'medium',
  }

  render() {
    const { className = '', size, ...rest } = this.props;
    const newClassName = `${className} ani-std-button ani-button-${size}`;
    return (
      <button
        className={newClassName}
        {...rest}
      />
    );
  }

}

export default Button;
