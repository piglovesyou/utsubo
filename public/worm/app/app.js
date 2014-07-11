
goog.provide('app.App');

goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.events.EventTarget');
goog.require('goog.events.InputHandler');
goog.require('goog.net.IframeLoadMonitor');
goog.require('goog.style');
goog.require('app.Scenario');
goog.require('goog.dom.forms');

var data;
var list;

/**
 * @constructor
 */
app.App = function() {


  // DOM
  var iframeEl = goog.dom.getElement('iframe');
  var iframeDocument = goog.dom.getFrameContentDocument(iframeEl);

  var pixelTopEl, pixelRightEl, pixelBottomEl, pixelLeftEl,
      pixelEl = goog.dom.createDom('div', 'worm-pixel',
        pixelTopEl = goog.dom.createDom('div', 'worm-pixel-border worm-pixel-border-top'),
        pixelRightEl = goog.dom.createDom('div', 'worm-pixel-border worm-pixel-border-right'),
        pixelBottomEl = goog.dom.createDom('div', 'worm-pixel-border worm-pixel-border-bottom'),
        pixelLeftEl = goog.dom.createDom('div', 'worm-pixel-border worm-pixel-border-left'));

  var selectorTextareaEl = goog.dom.getElementByClass('selector-textarea');
  var selectorButtonEl = goog.dom.getElementByClass('selector-button-a');
  var editorTitleInputEl = goog.dom.getElementByClass('editor-title-input');
  var maskEl = goog.dom.getElementByClass('mask');
  var scenarioEl = goog.dom.getElementByClass('scenario');
  var editorActionEl = goog.dom.getElementByClass('action-select');
  var editorVerifyEl = goog.dom.getElementByClass('verify-select');
  var editorModeSelectEl = goog.dom.getElementByClass('mode-select');
  var editorActionSelectEl = goog.dom.getElementsByTagNameAndClass('select', null, editorActionEl)[0];
  var editorVerifySelectEl = goog.dom.getElementsByTagNameAndClass('select', null, editorVerifyEl)[0];

  goog.dom.append(document.body, pixelEl);



  var selectorTextareaInputHandler = new goog.events.InputHandler(selectorTextareaEl);
  var scenario = new app.Scenario;








  var selectEnabled = false;
  function enableSelectMode(enable) {
    selectEnabled = enable;
    goog.style.setElementShown(maskEl, enable);
    if (enable) {
      goog.events.unlisten(selectorButtonEl, 'click', handleSelectorButtonClick, false);
      goog.events.unlisten(selectorTextareaInputHandler, goog.events.InputHandler.EventType.INPUT, handleSelectorTextKey);
      goog.events.listen(iframeDocument, 'click', stopPropagation, true);
      goog.events.listen(iframeDocument, 'click', handleIframeClick, true);
      goog.events.listen(iframeDocument, 'mouseover', handleIframeMouseOver);
    } else {
      goog.events.listen(selectorButtonEl, 'click', handleSelectorButtonClick, false);
      goog.events.listen(selectorTextareaInputHandler, goog.events.InputHandler.EventType.INPUT, handleSelectorTextKey);
      goog.events.unlisten(iframeDocument, 'click', stopPropagation, true);
      goog.events.unlisten(iframeDocument, 'click', handleIframeClick, true);
      goog.events.unlisten(iframeDocument, 'mouseover', handleIframeMouseOver);
    }
  }

  function handleSelectorTextKey(e) {
    console.log(goog.dom.forms.getValue(e.target));
  }

  function handleSelectorButtonClick(e) {
    enableSelectMode(true);
  }

  function handleIframeClick(e) {
    goog.dom.forms.setValue(selectorTextareaEl, buildSelector(e.target).join(' '));
    goog.dom.forms.setValue(editorTitleInputEl, goog.dom.getTextContent(e.target));
    enableSelectMode(false);
  }

  function handleIframeMouseOver(e) {
    var et = /** @type {Node} */(e.target);
    var iframePos = getIframePosision();
    var pos = goog.style.getPageOffset(et);
    redrawPixel(
        new goog.math.Coordinate(iframePos.x + pos.x, iframePos.y + pos.y),
        goog.style.getBorderBoxSize(et),
        buildSelector(et));
  }

  function getIframePosision() {
    var pos = goog.style.getPageOffset(iframeEl);
    pos.x += parseInt(goog.style.getComputedStyle(iframeEl, 'borderLeftWidth'), 10);
    pos.y += parseInt(goog.style.getComputedStyle(iframeEl, 'borderTopWidth'), 10);
    return pos;
  }

  function redrawPixel(pos, size, description) {
    goog.style.setPosition(pixelEl, pos);

    goog.style.setWidth(pixelTopEl, size.width);
    goog.style.setWidth(pixelBottomEl, size.width);
    goog.style.setHeight(pixelLeftEl, size.height);
    goog.style.setHeight(pixelRightEl, size.height);

    goog.style.setPosition(pixelRightEl, size.width, 0);
    goog.style.setPosition(pixelBottomEl, 0, size.height);
  }

  function buildSelector(node) {
    var rv = [];
    do {
      rv.push(node.tagName.toLowerCase() +
          (node.id ? '#' + node.id : '') +
          (node.className ? '.' + node.className.split(' ').join('.') : ''));
    } while ((node = node.parentNode) && node && node.tagName && node.tagName.toLowerCase() != 'html');
    return rv.reverse();
  }

  function stopPropagation(e) {
    console.log('stop');
    e.stopPropagation();
    e.preventDefault();
  }

  function handleIframeLoad() {
    enableSelectMode(false);

    scenario.decorate(scenarioEl);

    setupModeSelector();
  }



  function setupModeSelector() {
    console.log(editorModeSelectEl);
    goog.events.listen(editorModeSelectEl, 'change', toggleModeSelectorDependers);
    toggleModeSelectorDependers();
  }
  function toggleModeSelectorDependers() {
    switch(goog.dom.forms.getValue(editorModeSelectEl)) {
      case 'action':
        goog.style.setElementShown(editorActionEl, true);
        goog.style.setElementShown(editorVerifyEl, false);
        break;
      case 'verify':
        goog.style.setElementShown(editorActionEl, false);
        goog.style.setElementShown(editorVerifyEl, true);
        break;
    }
  }



  var iframeMonitor = new goog.net.IframeLoadMonitor(iframeEl);
  if (iframeMonitor.isLoaded()) {
    handleIframeLoad();
  } else {
    goog.events.listen(iframeMonitor,
        goog.net.IframeLoadMonitor.LOAD_EVENT, handleIframeLoad);
  }
};
goog.inherits(app.App, goog.events.EventTarget);

