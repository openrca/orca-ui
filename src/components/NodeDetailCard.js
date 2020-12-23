import React from 'react';
import ReactJson from 'react-json-view';
import * as d3 from 'd3';

import './NodeDetailCard.scss';

export class NodeDetailCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeData: {
        kind: '',
        properties: {
          name: ''
        }
      },
      hidden: true,
      displayProperties: [],
      stat: {}
    };
  }

  componentDidUpdate(){
    this.setState({
      nodeData: this.props.nodeData,
      displayProperties: this.props.nodeData.properties,
      hidden: this.props.hidden,
      stat: this.props.stat
    });
  }

  shouldComponentUpdate(nextProps) {
    return this.state.hidden !== nextProps.hidden || this.state.nodeData !== nextProps.nodeData || this.state.stat !== nextProps.stat;
  }

  show() {
    this.setState({ hidden: false });
  }

  render() {
    return (
      <div className={`card node-info-card ${this.state.hidden ? 'hidden' : ''} pt-0`}>
        <button type="button" className="close mt-1 mr-2 mb-0" aria-label="Close" onClick={this.props.hideDetailCard}>
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="card-body mt-0 pt-0">
          <h4 className="card-title">{this.state.nodeData.properties.name}</h4>
          <h5 className="card-subtitle">{this.state.nodeData.kind.replace('_', ' ')}</h5>
          <div className="card-text node-info-text">
            <ReactJson src={this.state.displayProperties} name={null} collapsed={2} displayDataTypes={false}/>
          </div>
        </div>
      </div>
    );
  }
}
