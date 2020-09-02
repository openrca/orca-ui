import React from 'react';
import './NodeDetailCard.scss';
import JSONViewer from 'react-json-viewer';


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
      displayProperties: {}
    };

    this.hide = this.hide.bind(this);
  }

  updateNodeData(nodeData, statistics = false) {
    let displayProperties = nodeData.properties;
    if(!statistics) {
      displayProperties = Object.keys(nodeData.properties).reduce((object, key) => {
        if(key !== 'name'){
          object[key] = nodeData.properties[key];
        }
  
        return object;
      }, {});
    }
    
    this.setState({ 
      nodeData: nodeData,
      displayProperties: displayProperties 
    });
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
          <h4 className="card-title">{this.state.nodeData.properties.name}</h4>
          <h5 className="card-subtitle">{this.state.nodeData.kind.replace('_', ' ')}</h5>
          <div className="card-text node-info-text">
            <JSONViewer json={this.state.displayProperties} />
          </div>
        </div>
      </div>
    );
  }
}
