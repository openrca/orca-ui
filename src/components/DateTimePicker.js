import React from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Navbar } from 'react-bootstrap';

import 'react-datepicker/dist/react-datepicker.css';

import './DateTimePicker.scss';

export class DateTimePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      options: this.props.options
    };
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  componentDidUpdate(){
    this.setState({
      options: this.props.options
    });
  }

  shouldComponentUpdate(nextProps){
    return this.state.options !== nextProps.options;
  }

  handleDateChange(date) {
    this.setState({
      date: date
    }, () => {
      this.props.onSelect();
    });
  }

  handleRefresh() {
    this.props.onSelect();
  }

  render(){
    return(
      <Navbar bg="dark" variant="dark" expand="lg" fixed="bottom" >
        <div className="date-picker-container">
          <span onClick={this.handleRefresh} className="refresh">
            <i className="fas fa-sync-alt fa-lg refresh-icon" />
          </span>
          <DatePicker
            className="date-picker"
            selected={this.state.date}
            onChange={this.handleDateChange}
            dateFormat='dd/MM/yyyy hh:mm a'
            showTimeSelect
            timeIntervals={15}
            maxDate={new Date()}
          />
        </div>
        <div className="namespace-selector-container">
          <Select
            id='namespace-selector'
            className='react-select-container'
            classNamePrefix="react-select"
            menuPlacement="top"
            options={this.state.options}
            placeholder="Select Namespace.."
            onChange={(e) => this.props.handleNamespaceChange(e)}
            isClearable
          />
        </div>
      </Navbar>
    );
  }
}
