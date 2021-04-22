import React from 'react';
import Select from 'react-select';

import './NodeDetailCard.scss';

export class Selector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: true,
      selectedValue: null,
      options: [],
      selectorOptions: []
    };
  }

  componentDidUpdate(){
    this.setState({
      hidden: this.props.hidden,
      options: this.props.options,
      selectorOptions: this.props.options ? this.handleOptions(this.props.options) : null,
      selectedValue: this.props.options ? this.handleOptions(this.props.options)[0] : null
    });
  }

  handleOptions(rca_option) {
    return rca_option.map((option, index) => {
      return {
        value: index,
        label: option.score
      }
    });
  }

  shouldComponentUpdate(nextProps) {
    return this.state.hidden !== nextProps.hidden || this.state.options !== nextProps.options;
  }

  render() {
    return (
      <div className={`card node-info-card ${this.state.hidden ? 'hidden' : ''} pt-0`}>
        <div className="card-body mt-0 pt-0">
          <h4 className="card-title">Trajectories</h4>
          <div className="card-text node-info-text">
            <Select
              options={this.state.selectorOptions}
              onChange={(e) => this.props.handleChange(e)}
              value={this.state.selectedValue}
            />
          </div>
        </div>
      </div>
    );
  }
}
