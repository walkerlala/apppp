import * as React from 'react';
import { Workspace } from 'common/workspace';
import { WorkspaceItemContainer, WorkspaceThumbnail, WorkspaceTextContainer } from './styles';

export interface WorkspaceItemProps {
  data: Workspace;
  onClick?: (id: number) => void;
}

interface State {
  isMouseEntered: boolean
}

class WorkspaceItem extends React.PureComponent<WorkspaceItemProps, State> {

  constructor(props: WorkspaceItemProps) {
    super(props);
    this.state = {
      isMouseEntered: false,
    };
  }

  private handleMouseEntered = (e: React.MouseEvent) => {
    this.setState({
      isMouseEntered: true,
    });
  }

  private handleMouseLeave = (e: React.MouseEvent) => {
    this.setState({
      isMouseEntered: false,
    });
  }

  private handleClicked = (e: React.MouseEvent) => {
    if (!this.props.onClick) return;
    this.props.onClick(this.props.data.id);
  }

  render() {
    const { name } = this.props.data;
    const { isMouseEntered } = this.state;
    return (
      <WorkspaceItemContainer
        onClick={this.handleClicked}
        onMouseEnter={this.handleMouseEntered}
        onMouseLeave={this.handleMouseLeave}
      >
        <WorkspaceThumbnail isHover={isMouseEntered}></WorkspaceThumbnail>
        <WorkspaceTextContainer>{name}</WorkspaceTextContainer>
      </WorkspaceItemContainer>
    );
  }

}

export default WorkspaceItem;
