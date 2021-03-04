class Modal {


  constructor(url, callback) {
    this._url = url;
    this._init();
  }


  _init() {
    const processResponse = res => {
      console.log(res)
    };

    window.kom.getText(this._url).then(processResponse).catch(processResponse);
  }


}


export default Modal;
