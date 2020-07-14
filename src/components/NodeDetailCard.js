import React from 'react';
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
      hidden: true
    };

    this.hide = this.hide.bind(this);
  }

  updateNodeData(nodeData) {
    this.setState({ nodeData: nodeData });
  }

  hide() {
    this.setState({ hidden: true });
  }

  show() {
    this.setState({ hidden: false });
  }

  render() {
    return (
      <div className={`card node-info-card ${this.state.hidden ? 'hidden' : ''} pt-0`}>
        <button type="button" className="close mt-1 mr-2 mb-0" aria-label="Close" onClick={this.hide}>
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="card-body mt-0 pt-0">
          <h4 className="card-title">{this.state.nodeData.kind.replace('_', ' ')}</h4>
          <h5 className="card-subtitle">{this.state.nodeData.properties.name}</h5>
          <div className="card-text node-info-text">
            <pre>{JSON.stringify(this.state.nodeData.properties, function (k, v) {
              if (k !== 'name') {
                return v;
              }
            }, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }
}
