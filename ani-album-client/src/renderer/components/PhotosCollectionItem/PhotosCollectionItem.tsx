import React, { useState, memo } from 'react';
import { ThumbnailType } from 'protos/ipc_pb';
import { ImageWithThumbnails } from 'common/image';
import { ThumbnailPadContainer, Container, ThumbnailsContainer, LineDivider, TextContainer } from './styles';
import { isUndefined } from 'lodash';

export interface PhotosCollectionItemProps {
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  name: string;
  images: ImageWithThumbnails[];
}

interface WorkspaceThumbnailPadProps {
  imageSrc?: string;
}

const WorkspaceThumbnailPad  = (props: WorkspaceThumbnailPadProps) => {
  const { imageSrc } = props;

  if (isUndefined(imageSrc)) {
    return <ThumbnailPadContainer />
  }

  return (
    <ThumbnailPadContainer>
      <img src={imageSrc} alt="" />
    </ThumbnailPadContainer>
  );
}

const PhotosCollectionItem = (props: PhotosCollectionItemProps) => {
  const [ isMouseEntered, setIsMouseEntered ] = useState(false);

  const renderThumbnails = () => {
    const { images } = props;
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

  return (
    <Container
      onClick={props.onClick}
      onMouseEnter={() => setIsMouseEntered(true)}
      onMouseLeave={() => setIsMouseEntered(false)}
      onContextMenu={props.onContextMenu}
    >
      <ThumbnailsContainer isHover={isMouseEntered}>
        <LineDivider direction="vertical" />
        <LineDivider direction="horizontal" />
        {renderThumbnails()}
        <WorkspaceThumbnailPad />
        <WorkspaceThumbnailPad />
        <WorkspaceThumbnailPad />
        <WorkspaceThumbnailPad />
      </ThumbnailsContainer>
      <TextContainer>{props.name}</TextContainer>
    </Container>
  );
}

export default memo(PhotosCollectionItem);
