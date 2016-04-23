const React = require('react');
const { Router, Route, IndexRoute, Link, IndexLink, hashHistory } = require('react-router');
const {DRIVER_TARGET_ID} = require('../../const');
const SvgMask = require('./SvgMask');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const {dispatch, dispatchChange} = require('../../dispatcher');

class Browser extends React.Component {
  render() {
    const {isPlaybacking} = this.props;
    return (
      <div className="browser">
        <div className="browser__header">
          <div className="row">
            <div className="col-lg-6">
              <div className="input-group input-group-lg">
                <span className="input-group-btn">
                  <button className="btn btn-default"
                      title="history.back()"
                      onClick={this.props.onHistoryBackClick}
                  >
                    <i className="fa fa-arrow-left"></i>
                  </button>
                  <button className="btn btn-default"
                      title="location.reload()"
                      onClick={this.props.onLocationReloadClick}
                  >
                    <i className="fa fa-refresh"></i>
                  </button>
                </span>
                <form className=""
                    onSubmit={this.props.onLocationTextSubmit}
                >
                  <input type="text"
                      ref="locationInput"
                      className="browser_location-input input-lg form-control"
                      placeholder="Target url"
                  />
                </form>
                <span className="input-group-btn">
                  <button className={'btn btn-default browser__rec-btn' + (this.props.disablePageMove ? ' browser__rec-btn--active' : '')}
                      title={this.props.disablePageMove ? 'Stop recording' : 'Start recording'}
                      onClick={isPlaybacking ? null : this.onRecordButtonClick.bind(this)}
                  >
                    <i className="fa fa-circle"></i>
                  </button>
                  <button className={'btn btn-default' + (this.props.disablePageMove ? ' disabled' : '')}
                      onClick={!this.props.disablePageMove ? () => hashHistory.push('dashboard') : null}
                  >
                    <i className="fa fa-bars"></i>
                  </button>
                  <button className={'btn btn-default' + (this.props.disablePageMove ? ' disabled' : '')}
                      onClick={!this.props.disablePageMove ? () => hashHistory.push('dashboard/setting') : null}>
                    <i className="fa fa-cog"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="browser__body">
          <iframe id={DRIVER_TARGET_ID}
            ref="iframe"
            src={this.props.location}
            onLoad={this.props.onIFrameLoaded}
            className="browser__iframe"
          />
          <ReactCSSTransitionGroup
              transitionName="svg-mask"
              transitionEnterTimeout={100}
              transitionLeaveTimeout={100}
          >
            {this.props.spotRect
              ? <SvgMask {...this.props.spotRect} />
              : null}
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }

  onRecordButtonClick(e) {
    dispatch({ type: 'click-recording' });
  }

  get iFrameEl() {
    return this.refs.iframe;
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.refs.iframe.contentWindow.location &&
        this.props.location !== this.refs.iframe.contentWindow.location.href;
  }
  get locationInputEl() {
    return this.refs.locationInput;
  }

}

module.exports = Browser;

