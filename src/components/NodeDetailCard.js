import React from 'react';
import ReactJson from 'react-json-view';
import { Button } from 'react-bootstrap';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Link } from 'react-router-dom';

import 'react-tabs/style/react-tabs.css';
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
      stat: {},
      floatRight: false,
      timestamp: null,
      rca: false
    };
  }

  componentDidUpdate(){
    this.setState({
      nodeData: this.props.nodeData,
      displayProperties: this.props.nodeData.properties,
      hidden: this.props.hidden,
      stat: this.props.stat,
      floatRight: this.props.floatRight,
      timestamp: this.props.timestamp,
      rca: this.props.rca
    });
  }

  shouldComponentUpdate(nextProps) {
    return this.state.hidden !== nextProps.hidden || this.state.nodeData !== nextProps.nodeData || this.state.stat !== nextProps.stat 
      || this.state.timestamp != nextProps.timestamp;
  }

  show() {
    this.setState({ hidden: false });
  }

  render() {
    return (
      <div className={`card node-info-card ${this.state.hidden ? 'hidden' : ''} pt-0 ${this.state.floatRight ? "right" : ''}`}>
        <button type="button" className="close mt-1 mr-2 mb-0" aria-label="Close" onClick={this.props.hideDetailCard}>
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="card-body mt-0 pt-0">
          <h4 className="card-title">{this.state.nodeData.properties.name}</h4>
          <h5 className="card-subtitle">{this.state.nodeData.kind.replace('_', ' ')}</h5>
          { this.state.nodeData.kind === 'alert' && this.state.rca === false ?
            <Tabs>
              <TabList>
                <Tab>Info</Tab>
                <Tab>RCA</Tab>
              </TabList>
              <TabPanel>
                <div className="card-text node-info-text">
                  <ReactJson src={this.state.displayProperties} name={null} collapsed={2} displayDataTypes={false}/>
                </div>
              </TabPanel>
              <TabPanel>
                <p> Perform Root Cause Analysis </p>
                <Link to={`/rca?source=${this.state.nodeData.id}&time_point=${this.state.timestamp}`} >
                  <Button className="rca" size="sm" variant="outline-warning">
                    Analyze
                  </Button>
                </Link>
              </TabPanel>
            </Tabs>
            :
            <div className="card-text node-info-text">
              <ReactJson src={this.state.displayProperties} name={null} collapsed={2} displayDataTypes={false}/>
            </div> 
          }
        </div>
      </div>
    );
  }
}
