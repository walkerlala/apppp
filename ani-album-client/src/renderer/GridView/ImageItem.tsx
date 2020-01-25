import React, { Component } from 'react';
import { ImageWithThumbnails } from 'common/image';
import { ThumbnailType } from 'protos/ipc_pb';

export interface ImageItemProps {
  data: ImageWithThumbnails;
}

class ImageItem extends Component<ImageItemProps> {

  private getMediumThumbnail(image: ImageWithThumbnails): string {
    const { thumbnails, path } = image;
    if (typeof thumbnails === 'undefined' || thumbnails.length == 0) {
      return path;
    }

    for (const item of thumbnails) {
      if (item.type == ThumbnailType.MEDIUM) {
        return item.path;
      }
    }

    return path;
  }
  render() {
    const { data } = this.props;
    const thumbnailPath = this.getMediumThumbnail(data);
    return (
      <div className="ani-grid-item" data-id={data.id.toString()}>
        <div className="ani-img-container">
          <img src={`file://${thumbnailPath}`} />
        </div>
      </div>
    );
  }

}

export default ImageItem;
