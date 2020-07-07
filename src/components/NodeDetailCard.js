import React from 'react';
import './NodeDetailCard.scss';


export class NodeDetailCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeData: {
        kind: ''
      },
      hidden: true
    };

    this.hide = this.hide.bind(this);
  }

  updateNodeData(nodeData) {
    this.setState({nodeData: nodeData});
  }

  hide() {
    this.setState({ hidden: true });
  }

  show() {
    this.setState({ hidden: false });
  }

  render() {
    return (
      <div className={`card node-info-card ${this.state.hidden ? 'hidden' : ''}`}>
        <button type="button" className="close" aria-label="Close" onClick={this.hide}>
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="card-body">
          <h5 className="card-title">{this.state.nodeData.kind.replace('_', ' ')}</h5>
          <div className="card-text node-info-text">
            <pre>{JSON.stringify(this.state.nodeData, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }
}
