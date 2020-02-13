import * as React from 'react';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { ViewData } from 'renderer/data/viewData';
import { Container } from './styles';
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

  @action
  private handleImageDoubleClicked = (imageId: number, thumbnailPath: string) => {
    const { viewDataStore } = this.props;
    viewDataStore.imageViewerData = {
      imageId,
      thumbnailPath,
    };
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
