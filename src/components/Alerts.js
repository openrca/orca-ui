import React from 'react';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';

import './Alerts.scss';

export class Alerts extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      alerts: []
    }
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/graph')
      .then((response) => {
        const alertList = response.data.nodes.filter(node => node.kind === 'alert');
        this.setState({
          alerts: alertList
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    const columns = [{
      dataField: 'id',
      text: 'ID'
    }, {
      dataField: 'origin',
      text: 'Origin'
    }, {
      dataField: 'properties.name',
      text: 'Name'
    }];

    return(
      <div class="alertTable">
        <BootstrapTable keyField='id' data= {this.state.alerts} columns={columns}/>
      </div>
    )
  }
}
