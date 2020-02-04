import * as React from 'react';
import { Container } from './styles';
import GridView from 'renderer/components/GridView';

export interface MyPhotosPageProps {
  show: boolean;
}

class MyPhotosPage extends React.Component<MyPhotosPageProps> {

  render() {
    const { show } = this.props
    return (
      <Container show={show}>
        <GridView show />
      </Container>
    );
  }

}

export default MyPhotosPage;
