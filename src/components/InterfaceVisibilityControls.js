import React from 'react';
import './InterfaceVisibilityControls.scss';

export class InterfaceVisibilityControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLabels: this.props.showLabels
    };
  }

  componentDidUpdate() {
    this.setState({
      showLabels: this.props.showLabels
    });
  }

  shouldComponentUpdate(nextProps) {
    return this.state.showLabels !== nextProps.showLabels;
  }

  render() {
    return (
      <div className='interface-visibility-controls-container'>
        <div className="custom-control custom-switch custom-switch-sm">
          <input className="custom-control-input" id="labels-toggle" type="checkbox" checked={this.props.showLabels} onChange={(e) => this.props.toggleNodeLabels(e)} />
          <label className="custom-control-label" for="labels-toggle">
            <span className="custom-control-text">labels</span>
          </label>
        </div>
      </div>
    );
  }
}
