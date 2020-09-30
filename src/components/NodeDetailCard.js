import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

import './NodeDetailCard.scss';
import './Table.scss';

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
      statistics: false
    };

    this.hide = this.hide.bind(this);
  }

  updateNodeData(nodeData, statistics = false) {
    let displayProperties = nodeData.properties;
    if(!statistics) {
      displayProperties = Object.keys(nodeData.properties).reduce((object, key) => {
        if(key !== 'name'){
          object['attribute'] = key;
          object['value'] = nodeData.properties[key];
        }
  
        return object;
      }, {});
      displayProperties = [displayProperties];
    } else {
      displayProperties = nodeData.properties.map((object) => {
        object['attribute'] = object.type;
        object['value'] = object.count;
        return object;
      });
    }
    
    this.setState({ 
      nodeData: nodeData,
      displayProperties: displayProperties,
      statistics: statistics
    });
  }

  hide() {
    this.setState({ hidden: true });
  }

  show() {
    this.setState({ hidden: false });
  }

  render() {
    const columns = [{
      dataField: 'attribute',
      text: 'attribute',
      headerAttrs: {
        hidden: true
      }
    }, {
      dataField: 'value',
      text: 'value',
      headerAttrs: {
        hidden: true
      }
    }];
    const columnsStats = [{
      dataField: 'type',
      text: 'type',
      headerAttrs: {
        hidden: true
      }
    }, {
      dataField: 'count',
      text: 'count',
      headerAttrs: {
        hidden: true
      }
    }];
    return (
      <div className={`card node-info-card ${this.state.hidden ? 'hidden' : ''} pt-0`}>
        <button type="button" className="close mt-1 mr-2 mb-0" aria-label="Close" onClick={this.hide}>
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="card-body mt-0 pt-0">
          <h4 className="card-title">{this.state.nodeData.properties.name}</h4>
          <h5 className="card-subtitle">{this.state.nodeData.kind.replace('_', ' ')}</h5>
          <div className="card-text node-info-text">
            <BootstrapTable keyField='id' data={this.state.displayProperties} columns={this.state.statistics ? columnsStats : columns} 
              classes="table-dark" bootstrap4 striped hover/>
          </div>
        </div>
      </div>
    );
  }
}
