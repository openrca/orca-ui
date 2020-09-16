import React from 'react';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from 'react-loader-spinner';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter, selectFilter, dateFilter } from 'react-bootstrap-table2-filter';

import './Alerts.scss';
import './Table.scss';

export class Alerts extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      alerts: [],
      loading: true
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/alerts')
      .then((response) => {
        const alerts = response.data.map(alert => {
          alert.updated_at = new Date(1000 * alert.updated_at);
          return alert;
        });

        this.setState({
          alerts: alerts,
          loading: false
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  severityFormatter(cell) {
    let badgeStyle = 'badge-secondary';
    switch(cell) {
    case 'critical':
      badgeStyle = 'badge-danger';
      break;
    case 'warning':
      badgeStyle = 'badge-warning';
      break;
    case 'info':
      badgeStyle = 'badge-info';
      break;
    default:
      break;
    }

    return (
      <span className={`badge ${badgeStyle}`}> {cell.toUpperCase()} </span>
    );
  }

  originFormatter(cell) {
    return (
      <span> {cell.charAt(0).toUpperCase() + cell.slice(1)} </span>
    )
  }

  severitySortFunc(a, b, order, dataFiled) {
    const valuesOrder = ['critical', 'warning', 'info'];
    if(order === 'asc') {
      return valuesOrder.indexOf(b) - valuesOrder.indexOf(a);
    } else {
      return valuesOrder.indexOf(a) - valuesOrder.indexOf(b);
    }
  }

  timestampFormatter(cell) {
    return (
      <span> {cell.toUTCString()} </span>
    );
  }

  getOptions(field) {
    const optionsUnique = [...new Set(this.state.alerts.map(alert => alert[field]))];
    return optionsUnique.reduce((options, field) => ({...options, [field]: field}), {});
  }

  render() {
    const columns = [{
      dataField: 'severity',
      text: 'Severity',
      formatter: this.severityFormatter,
      sort: true,
      sortFunc: this.severitySortFunc,
      filter: selectFilter({
        options: this.getOptions('severity')
      })
    }, {
      dataField: 'updated_at',
      text: 'Timestamp',
      formatter: this.timestampFormatter,
      sort: true,
      filter: dateFilter()
    }, {
      dataField: 'origin',
      text: 'Origin',
      formatter: this.originFormatter,
      sort: true,
      filter: selectFilter({
        options: this.getOptions('origin')
      })
    }, {
      dataField: 'name',
      text: 'Name',
      sort: true,
      filter: textFilter()
    }, {
      dataField: 'message',
      text: 'Message',
      sort: true,
      filter: textFilter()
    }];

    const defaultSort = [{
      dataField: 'severity',
      order: 'desc'
    }];

    return(
      <div>
        {this.state.loading
          ? <span className="loader">
            <Loader type="TailSpin" visible={this.state.loading} color='#343a40'/>
          </span>
          : <div className="alertTable" style={{hidden: this.state.loading}}>
            <BootstrapTable keyField='id' data={this.state.alerts} columns={columns} classes="table-dark" bootstrap4 striped hover
              defaultSorted={defaultSort} pagination={paginationFactory()} filter={filterFactory()} bordered={false}/>
          </div>
        }
      </div>
    );
  }
}
