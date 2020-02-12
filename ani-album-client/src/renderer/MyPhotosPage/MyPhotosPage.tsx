import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { ViewData } from 'renderer/data/viewData';
import { Container } from './styles';
import { eventBus, RendererEvents } from 'renderer/events';
import GridView from 'renderer/components/GridView';

export interface MyPhotosPageProps {
  show: boolean;
  viewDataStore?: ViewData;
}

interface MyPhotosPageState {
  selectedIds: Set<number>;
}

@inject('viewDataStore')
@observer
class MyPhotosPage extends React.Component<MyPhotosPageProps, MyPhotosPageState> {

  constructor(props: MyPhotosPageProps) {
    super(props);
    this.state = {
      selectedIds: new Set(),
    };
  }

  private handleImageDoubleClicked = (imageId: number, thumbnailPath: string) => {
    eventBus.emit(RendererEvents.PhotoItemDoubleClicked, imageId, thumbnailPath);
  }

  private handleSelectedIdsUpdate = (newSet: Set<number>) => {
    this.setState({
      selectedIds: newSet,
    });
  }

  render() {
    const { show, viewDataStore } = this.props;
    const { selectedIds } = this.state;
    return (
      <Container show={show}>
        <GridView
          selectedIds={selectedIds}
          scaleToFit={viewDataStore.scaleToFit}
          onImageDoubleClicked={this.handleImageDoubleClicked}
          onSelectedIdsChanged={this.handleSelectedIdsUpdate}
        />
      </Container>
    );
  }

}

export default MyPhotosPage;
