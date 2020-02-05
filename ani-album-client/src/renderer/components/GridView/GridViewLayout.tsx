import * as React from 'react';
import './GridView.scss';

export interface GridViewLayoutProps {
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  ref?: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
}

const GridViewLayout = (props: GridViewLayoutProps) => {
  const { children, ref, onContextMenu } = props;

  return (
    <div className="ani-grid-view" ref={ref} onContextMenu={onContextMenu}>
      {children}
    </div>
  );
}

export default GridViewLayout;
