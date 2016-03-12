const _ = require('underscore');
const {CHANGE_EVENT} = require('../constants');
const Base = require('./base');

const TIMEOUT = 7 * 1000;
const default_ = {
  active: false,
  icon: null,
  message: '', // If not empty, show notification
  linkUrl: null,
  type: null // warning, danger, info..
};

class NotifyState extends Base {
  constructor() {
    super();
    this.store_ = _.clone(default_);
    this.timerId = null;
  }
  dispatcherHandler_(action) {
    switch (action.type) {
    case 'notify':
      this.store_ = action.notifyData;
      if (this.store_.active === false) {
        this.restore();
        return;
      }
      this.store_.active = true;
      clearTimeout(this.timerId);
      this.timerId = setTimeout(this.restore.bind(this), TIMEOUT);
      this.emit(CHANGE_EVENT);
      break;
    }
  }
  restore() {
    clearTimeout(this.timerId);
    this.timerId = null;
    // To show fading message
    this.store_.active = false;
    this.emit(CHANGE_EVENT);
  }
}

module.exports = new NotifyState();
