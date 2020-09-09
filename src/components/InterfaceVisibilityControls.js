import React from 'react';

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

  shouldComponentUpdate(nextProps){
    return this.state.showLabels !== nextProps.showLabels;
  }

  render() {
    return (
      <div className='interface-visibility-controls-container'>
        <div class="custom-control custom-switch">
          <input type="checkbox" className="custom-control-input" id="customSwitch1" checked={this.props.showLabels} onChange={(e) => this.props.toggleNodeLabels(e)} />
          <label class="custom-control-label" for="customSwitch1">show labels</label>
        </div>
      </div>
    );
  }
}
