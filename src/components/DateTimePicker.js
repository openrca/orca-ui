import React from 'react';
import DatePicker from 'react-datepicker';
import { Navbar } from 'react-bootstrap';

import 'react-datepicker/dist/react-datepicker.css';

import './DateTimePicker.scss';

export class DateTimePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date()
    };
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
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

  render() {
    return (
      <Navbar bg="dark" variant="dark" expand="lg" fixed="bottom" >
        <div className="date-picker ml-auto">
          <span onClick={this.handleRefresh} className="refresh">
            <i className="fa fa-refresh fa-lg" />
          </span></div>
        <DatePicker
          selected={this.state.date}
          onChange={this.handleDateChange}
          dateFormat='dd/MM/yyyy hh:mm a'
          showTimeSelect
          timeIntervals={15}
          maxDate={new Date()}
        />
      </Navbar>
    );
  }
}
