import * as React from 'react';
import { Workspace } from 'common/workspace';
import {
  WorkspaceItemContainer, WorkspaceThumbnail,
  WorkspaceTextContainer, WorkspaceThumbnailPadContainer,
  LineDivider,
} from './styles';
import { ImageWithThumbnails } from 'common/image';
import { ipcRenderer } from 'electron';
import { ClientMessageType } from 'common/message';
import { isUndefined } from 'lodash';
import { ThumbnailType } from 'protos/ipc_pb';

interface WorkspaceThumbnailPadProps {
  imageSrc?: string;
}

const WorkspaceThumbnailPad  = (props: WorkspaceThumbnailPadProps) => {
  const { imageSrc } = props;

  if (isUndefined(imageSrc)) {
    return <WorkspaceThumbnailPadContainer />
  }

  return (
    <WorkspaceThumbnailPadContainer>
      <img src={imageSrc} alt="" />
    </WorkspaceThumbnailPadContainer>
  );
}

export interface WorkspaceItemProps {
  data: Workspace;
  onClick?: (id: number) => void;
}

interface State {
  isMouseEntered: boolean;
  images: ImageWithThumbnails[];
}

class WorkspaceItem extends React.PureComponent<WorkspaceItemProps, State> {

  constructor(props: WorkspaceItemProps) {
    super(props);
    this.state = {
      isMouseEntered: false,
      images: [],
    };
  }

  componentDidMount() {
    this.fetchThumbnails();
  }

  private async fetchThumbnails() {
    try {
      const { id } = this.props.data;
      const images: ImageWithThumbnails[] = await ipcRenderer.invoke(ClientMessageType.GetImagesByWorkspaceId, id);
      this.setState({ images });
    } catch (err) {
      console.error(err);
    }
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

  private renderThumbnails() {
    const { images } = this.state;
    const result: React.ReactNode[] = [];

    for (let i = 0; i < 4; i++) {
      const image: ImageWithThumbnails | undefined = images[i];
      if (isUndefined(image)) {
        result.push(<WorkspaceThumbnailPad key={i} />);
        continue;
      }
      const smallThumbnail = image.thumbnails.filter(t => t.type === ThumbnailType.SMALL);
      const src = smallThumbnail.length > 0 ? smallThumbnail[0].path : image.path;
      result.push(<WorkspaceThumbnailPad key={i} imageSrc={src} />)
    }

    return result;
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
        <WorkspaceThumbnail isHover={isMouseEntered}>
          <LineDivider direction="vertical" />
          <LineDivider direction="horizontal" />
          {this.renderThumbnails()}
          <WorkspaceThumbnailPad />
          <WorkspaceThumbnailPad />
          <WorkspaceThumbnailPad />
          <WorkspaceThumbnailPad />
        </WorkspaceThumbnail>
        <WorkspaceTextContainer>{name}</WorkspaceTextContainer>
      </WorkspaceItemContainer>
    );
  }

}

export default WorkspaceItem;
