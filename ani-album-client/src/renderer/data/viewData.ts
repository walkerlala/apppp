import { observable } from 'mobx';

export class ViewData {

  @observable
  scaleToFit: boolean = true;

}

const viewDataStore = new ViewData();

export default viewDataStore;
