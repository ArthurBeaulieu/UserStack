import '../scss/App.scss';


class App {


  constructor() {
    this._init();
  }


  _init() {
    console.log('Welcome to UserStack');
  }


}


window.app = new App();
export default App;
