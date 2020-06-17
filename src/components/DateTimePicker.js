import React from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

export class DateTimePicker extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      date: new Date()
    };
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  handleDateChange(date){
    this.setState({
      date: date
    }, () => {
      this.props.onSelect();
    });
  }

  render(){
    return(
      <div className="bottom-bar">
        <div className="date-picker">
          <DatePicker
            selected={this.state.date}
            onChange={this.handleDateChange}
            dateFormat='dd/MM/yyyy hh:mm a'
            showTimeSelect
            timeIntervals={15}
            maxDate={new Date()}
          />
        </div>
      </div>
    );
  }
}
