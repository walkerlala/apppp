import * as React from 'react';
import ImportButton from 'renderer/components/ImportButton';
import { MainContentContainer } from 'renderer/styles';

export interface WorkspaceContentPageProps {
  pageKey: string;
}

class WorkspaceContentPage extends React.Component<WorkspaceContentPageProps> {

  render() {
    return (
      <MainContentContainer>
        <ImportButton textContent="Import images from My Photos to the workspace..." />
      </MainContentContainer>
    );
  }

}

export default WorkspaceContentPage;
