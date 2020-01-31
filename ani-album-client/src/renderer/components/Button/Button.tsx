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
    let { className = '', size, ...rest } = this.props;
    className += ` ani-std-button ani-button-${size}`;
    return (
      <button
        className={className}
        {...rest}
      />
    );
  }

}

export default Button;
