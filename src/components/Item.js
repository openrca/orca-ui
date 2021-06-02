import React from 'react';

import './Item.scss';

export class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      option: this.props.option,
      source: this.props.option.nodes[0],
      rootCause: this.props.option.nodes[this.props.option.nodes.length - 1]
    };
  }

  scoreClass() {
    if(this.state.option.score <= 0.5) return 'weak';
    else if(this.state.option.score <= 0.75) return 'medium';
    else return 'strong';
  }

  render() {
    return (
      <div className="item">
        <div className={"score " + this.scoreClass()}> <b> {this.state.option.score} </b> </div>
        <div> <b> Source: </b> {this.state.source.properties.name} </div>
        <div> <b> Root Cause: </b> {this.state.rootCause.properties.name} </div>
      </div>
    );
  }
}
