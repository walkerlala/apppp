import React, { Component } from 'react';
import { ImageWithThumbnails } from 'common/image';
import { ThumbnailType } from 'protos/ipc_pb';
import { eventBus, RendererEvents } from 'renderer/events';
import { isUndefined } from 'lodash';

export interface ImageItemProps {
  data: ImageWithThumbnails;
  isSelected: boolean;
  scaleToFit: boolean;
  onImageDoubleClicked?: (imageId: number, thumbnailPath: string) => void;
}

class ImageItem extends Component<ImageItemProps> {

  private handleImageClicked = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    const { id } = this.props.data;
    eventBus.emit(RendererEvents.PhotoItemClicked, id);
  }

  private handleImageDoubleClicked = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    const { data, onImageDoubleClicked } = this.props;

    if (isUndefined(onImageDoubleClicked)) return;

    const thumbnailPath = this.getMediumThumbnail(data);
    onImageDoubleClicked(data.id, thumbnailPath);
  }

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
    const { data, isSelected, scaleToFit } = this.props;
    const thumbnailPath = this.getMediumThumbnail(data);
    let className = 'ani-img';
    if (scaleToFit) {
      className += ' ani-img-cover';
    }
    return (
      <div className={`ani-grid-item ${isSelected ? 'selected' : ''}`} data-id={data.id.toString()}>
        <div className="ani-img-container">
          <img
            className={className}
            src={`file://${thumbnailPath}`}
            onClick={this.handleImageClicked}
            onDoubleClick={this.handleImageDoubleClicked}
          />
        </div>
      </div>
    );
  }

}

export default ImageItem;
