import styled from 'styled-components';

export const ImportContainer = styled.div`
`;

export const GridViewContainer = styled.div`
  margin-top: 16px;
  flex-grow: 1;
`; 

export const Heading = styled.div`
  margin-top: 16px;
  font-size: 18px;
`;

export const ContentContainer = styled.div`
  flex-grow: 1;
  padding-left: 24px;
  padding-right: 36px;
  overflow: auto;
`;

export const WorkspacesContainer = styled.div`
  display: flex;
`;

export const WorkspaceItemContainer = styled.div`
  padding-right: 24px;
  padding-top: 16px;

  &:hover {
    cursor: pointer;
  }
`;

export interface WorkspaceThumbnailProps {
  isHover: boolean;
}

export const WorkspaceThumbnail = styled.div`
  width: 180px;
  min-width: 180px;
  height: 180px;
  min-height: 180px;
  background-color: #d4d4d4;
  border-radius: 12px;
  ${(props: WorkspaceThumbnailProps) => props.isHover ?
    'box-shadow: 0px 0px 8px 2px rgba(0, 0, 0, 0.2);' : 
    ''
  }
`;

export const WorkspaceTextContainer = styled.div`
  color: #5a5a5a;
  font-size: 12px;
  text-align: center;
  padding-top: 12px;
`;
