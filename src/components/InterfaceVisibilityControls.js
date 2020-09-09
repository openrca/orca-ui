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
          <input type="checkbox" checked={this.props.showLabels} onChange={(e) => this.props.toggleNodeLabels(e)} />
        </div>
      </div>
    );
  }
}
