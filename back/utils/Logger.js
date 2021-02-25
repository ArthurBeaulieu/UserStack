const fs = require('fs');
const path = require('path');
const utils = require('./server.utils');


class Logger {


  constructor(options) {
    const d = new Date();
    this._debug = options.debug;
    this._date = `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
    this._logFile = null;
    this._prepareFileLogging();
  }


  _prepareFileLogging() {
    const filePath = `${path.dirname(require.main.filename)}/log/Log-${this._date}.log`;
    if (!fs.existsSync(filePath)) {
      // Create folder
      if (!fs.existsSync(`${path.dirname(require.main.filename)}/log/`)) {
        fs.mkdirSync(`${path.dirname(require.main.filename)}/log/`, { recursive: true });
      }
      // Create file
      fs.writeFileSync(filePath, '');
    }
    // Saved file path
    this._logFile = filePath;
  }


  raise(options) {
    const d = new Date();
    const date = utils.formatDate();
    const output = `[${options.verb.toUpperCase()}] ${date} : ${options.message}`;
    if (this._debug) {
      let color = '\x1b[0m';
      if (options.verb === 'error') {
        color = '\x1b[31m';
      } else if (options.verb === 'warn') {
        color = '\x1b[33m';
      }
      console[options.verb](`${color}%s\x1b[0m`, output);
    }
    // Day changed, creating new log file
    const logDate = `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
    if (this._date !== logDate) {
      this._date = logDate;
      this._logFile = `${path.dirname(require.main.filename)}/log/Log-${this._date}.log`;
    }
    this._prepareFileLogging();
    // Dump raised issue into log file
    fs.appendFile(this._logFile, `${output}\n`, () => {});
  }


  error(message) {
    this.raise({
      verb: 'error',
      message: message
    });
  }


  warn(message) {
    this.raise({
      verb: 'warn',
      message: message
    });
  }


  info(message) {
    this.raise({
      verb: 'log',
      message: message
    })
  }


  reqError(opts) {
    if (opts.err) {
      // TODO retrieve status from opts.code in associated JSON (i18n ?)
      opts.res.status(500).send({
        status: 500,
        code: opts.code,
        message: 'Hey ho',
        info: opts.info || null
      });
      this.raise({
        verb: 'error', // todo, get from associated JSON,
        message: opts.err
      });
      return true;
    }

    return false;
  }


}


module.exports = Logger;