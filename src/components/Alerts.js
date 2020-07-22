import React from 'react';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from 'react-loader-spinner';

import './Alerts.scss';

export class Alerts extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      alerts: [],
      loading: true
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
          alerts: alertList,
          loading: false
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
      <div>
        {this.state.loading ? 
          <span className="loader">
            <Loader type="TailSpin" visible={this.state.loading} color='#343a40'/>
          </span> :
          <div class="alertTable" style={{hidden: this.state.loading}}>
            <BootstrapTable keyField='id' data= {this.state.alerts} columns={columns}/>
          </div>
        }
      </div>
    )
  }
}
