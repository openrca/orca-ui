import React from 'react';
import List from 'react-list-select';
import { Item } from './Item';

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
      selectorOptions: this.props.options ? this.handleOptions(this.props.options) : [],
      selectedValue: this.props.options ? this.handleOptions(this.props.options)[0] : null
    });
  }

  handleOptions(rca_option) {
    return rca_option.map((option, index) => {
      return <Item option={option} />
    });
  }

  shouldComponentUpdate(nextProps) {
    return this.state.hidden !== nextProps.hidden || this.state.options !== nextProps.options;
  }

  render() {
    return (
      <div className={`card node-info-card ${this.state.hidden ? 'hidden' : ''} pt-0`}>
        <div className="card-body mt-0 pt-0">
          <h4 className="card-title fault">Fault Trajectories</h4>
          <div className="card-text node-info-text">
            <List
              items={this.state.selectorOptions}
              selected={[0]}
              onChange={(selected) => { this.props.handleChange(selected) }}
            />
          </div>
        </div>
      </div>
    );
  }
}
