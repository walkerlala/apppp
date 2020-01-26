import React, { Component } from 'react';
import { ImageWithThumbnails } from 'common/image';
import { ThumbnailType } from 'protos/ipc_pb';
import { eventBus, RendererEvents } from 'renderer/events';

export interface ImageItemProps {
  data: ImageWithThumbnails;
  isSelected: boolean;
}

class ImageItem extends Component<ImageItemProps> {

  private handleImageClicked = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    const { id } = this.props.data;
    eventBus.emit(RendererEvents.PhotoItemClicked, id);
  }

  private handleImageDoubleClicked = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    const { data } = this.props;
    const thumbnailPath = this.getMediumThumbnail(data);
    eventBus.emit(RendererEvents.PhotoItemDoubleClicked, data.id, thumbnailPath);
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
    const { data, isSelected } = this.props;
    const thumbnailPath = this.getMediumThumbnail(data);
    return (
      <div className={`ani-grid-item ${isSelected ? 'selected' : ''}`} data-id={data.id.toString()}>
        <div className="ani-img-container">
          <img
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
