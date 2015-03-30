
goog.provide('app.Editor');

goog.require('app.model.Entry');
goog.require('app.soy.editor');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.Editor = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.Editor, goog.ui.Component);

/** @inheritDoc */
app.Editor.prototype.createDom = function() {
  this.setElementInternal(
      /** @type {Element} */(goog.soy.renderAsFragment(app.soy.editor.createDom)));
  this.draw();
};

/**
 * @type {Object}
 */
app.Editor.prototype.lastData_;

/**
 * @param {Object=} opt_data .
 */
app.Editor.prototype.draw = function(opt_data) {
  var data = opt_data || {};

  if (!data.id) {
    data.id = this.generateId();
  }
  if (!data.mode) {
    data.mode = 'action';
  }
  if (!data.type) {
    data.type = 'click';
  }

  goog.soy.renderElement(this.getElement(), app.soy.editor.renderContent, data);
  this.lastData_ = data;
};

/** @inheritDoc */
app.Editor.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.enable(true);
};

app.Editor.prototype.enable = function(enable) {

  var eh = this.getHandler();
  var dh = this.getDomHelper();
  if (enable) {
    eh.listen(this.getElement(), 'change', this.handleSelectChange);
    eh.listen(this.getElement(), 'click', this.handleClick);
    if (this.selectorInputHandler_) {
      this.selectorInputHandler_.dispose();
      this.selectorInputHandler_ = null;
    }
    this.selectorInputHandler_ = new goog.events.InputHandler(this.getElementByClass('entry-css'));
    eh.listen(this.selectorInputHandler_, goog.events.InputHandler.EventType.INPUT, this.handleSelectorTextKey);
  } else {
    eh.unlisten(this.getElement(), 'change', this.handleSelectChange);
    eh.unlisten(this.getElement(), 'click', this.handleClick);
    if (this.selectorInputHandler_) {
      eh.unlisten(this.selectorInputHandler_, goog.events.InputHandler.EventType.INPUT, this.handleSelectorTextKey);
      this.selectorInputHandler_.dispose();
      this.selectorInputHandler_ = null;
    }
  }

};

app.Editor.prototype.setRoughTitle = function(text) {
  goog.dom.forms.setValue(this.getElementByClass('entry-title'), text);
};

app.Editor.prototype.setSelectorText = function(text) {
  goog.dom.forms.setValue(this.getElementByClass('entry-css'), text);
};

app.Editor.prototype.handleSelectChange = function(e) {
  var selectEl = e.target;
  if (!selectEl.tagName == goog.dom.TagName.SELECT) {
    return;
  }
  // Update the last data and reuse it.
  goog.object.extend(this.lastData_, this.collectValues());
  this.applyDependencyVisibility(this.lastData_);
};

app.Editor.prototype.handleClick = function(e) {
  var tmp;
  var el = e.target;
  if (goog.dom.contains(this.getElementByClass('selector-button'), el)) {
    this.dispatchEvent('enter-select-mode');

  } else if ((tmp = this.getElementByClass('append-button')) && goog.dom.contains(tmp, el)) {
    this.dispatchEvent(new app.Editor.EditEntry(this.collectValues()));
    this.draw();

  } else if ((tmp = this.getElementByClass('quit-edit-button')) && goog.dom.contains(tmp, el)) {
    this.draw();
  }
};

app.Editor.prototype.handleSelectorTextKey = function(e) {
  this.dispatchEvent(new app.Editor.TextKey(
      /** @type {string} */(goog.dom.forms.getValue(this.getElementByClass('entry-css')))));
};

/***/
app.Editor.prototype.applyDependencyVisibility = function(data) {
  goog.dom.replaceNode(goog.soy.renderAsElement(app.soy.editor.bottomInputs, data),
      this.getElementByClass('editor-bottominputs'));
  if (data.mode == 'action' && data.type == 'open') {
    var url = /** @type {string} */(goog.global.localStorage.getItem('last-iframe-url'));
    if (url) {
      goog.dom.forms.setValue(this.getElementByClass('entry-text'), url);
    }
  }
};

/** @inheritDoc */
app.Editor.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};

/**
 */
app.Editor.prototype.collectValues = function() {
  var map = goog.dom.forms.getFormDataMap(/** @type {HTMLFormElement} */(this.getElementByClass('editor-form')));
  var data = {};
  var prefix = 'entry-';
  map.forEach(function(v, k) {
    if (goog.string.startsWith(k, prefix)) {
      data[k.slice(prefix.length)] = v[0];
    }
  });
  return new app.model.Entry(data);
};

app.Editor.prototype.generateId = function() {
  return goog.string.getRandomString() + '-' + goog.string.getRandomString();
};



/**
 * @constructor
 * @extends goog.events.Event
 * @param {Object} data
 * @param {Object=} opt_target
 */
app.Editor.EditEntry = function(data, opt_target) {
  goog.base(this, 'append-entry', opt_target);
  /** @type {Object} */
  this.data = data;
};
goog.inherits(app.Editor.EditEntry, goog.events.Event);

/**
 * @constructor
 * @extends goog.events.Event
 * @param {string} text
 * @param {Object=} opt_target
 */
app.Editor.TextKey = function(text, opt_target) {
  goog.base(this, 'selector-text-input', opt_target);
  /** @type {string} */
  this.text = text;
};
goog.inherits(app.Editor.TextKey, goog.events.Event);

