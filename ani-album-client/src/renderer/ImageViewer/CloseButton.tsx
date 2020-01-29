import React from 'react';
import './CloseButton.scss';

export interface CloseButtonProps {
  onClick?: (evt: React.MouseEvent<HTMLDivElement>) => void;
}

const CloseButton = (props: CloseButtonProps) => {
  const { onClick } = props;
  return (
    <div className="ani-close-button noselect" onClick={onClick}>
      Close
    </div>
  );
}

export default CloseButton;
