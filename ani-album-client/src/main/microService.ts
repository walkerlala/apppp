import {} from 'child_process';

export class MicroService {

  initialize() {

  }

  startAllServices() {
    this.startThumbnailsService();
  }

  startThumbnailsService() {

  }

}

const singleton = new MicroService();

export default singleton;
