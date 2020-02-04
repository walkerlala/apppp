import * as React from 'react';
import { Container } from './styles';
import { eventBus, RendererEvents } from 'renderer/events';
import GridView from 'renderer/components/GridView';

export interface MyPhotosPageProps {
  show: boolean;
}

interface MyPhotosPageState {
  scaleToFit: boolean;
  selectedIds: Set<number>;
}

class MyPhotosPage extends React.Component<MyPhotosPageProps, MyPhotosPageState> {

  constructor(props: MyPhotosPageProps) {
    super(props);
    this.state = {
      scaleToFit: true,
      selectedIds: new Set(),
    };
  }

  private handleImageDoubleClicked = (imageId: number, thumbnailPath: string) => {
    eventBus.emit(RendererEvents.PhotoItemDoubleClicked, imageId, thumbnailPath);
  }

  componentDidMount() {
    eventBus.addListener(RendererEvents.ToggleScaleToFit, this.handleToggleScaleToFit);
  }

  componentWillUnmount() {
    eventBus.removeListener(RendererEvents.ToggleScaleToFit, this.handleToggleScaleToFit);
  }

  private handleToggleScaleToFit = () => {
    const { scaleToFit } = this.state;
    this.setState({
      scaleToFit: !scaleToFit,
    });
  }

  private handleSelectedIdsUpdate = (newSet: Set<number>) => {
    this.setState({
      selectedIds: newSet,
    });
  }

  render() {
    const { show } = this.props;
    const { scaleToFit, selectedIds } = this.state;
    return (
      <Container show={show}>
        <GridView
          selectedIds={selectedIds}
          scaleToFit={scaleToFit}
          onImageDoubleClicked={this.handleImageDoubleClicked}
          onSelectedIdsChanged={this.handleSelectedIdsUpdate}
        />
      </Container>
    );
  }

}

export default MyPhotosPage;
