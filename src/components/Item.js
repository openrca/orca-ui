import React from 'react';

import './Item.scss';

export class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      option: this.props.option,
      source: this.props.option.nodes[0],
      rootCause: this.props.option.nodes[this.props.option.nodes.length - 1],

    };
  }

  componentDidMount() {
    console.log(this.state.option);
  }

  render() {
    return (
      <div className="item">
        <div className="score"> {this.state.option.score} </div>
        <div> Source: {this.state.source.properties.name} </div>
        <div> Root Cause: {this.state.rootCause.properties.name} </div>
      </div>
    );
  }
}
