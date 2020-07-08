import React from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

import 'react-datepicker/dist/react-datepicker.css';

export class DateTimePicker extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      date: new Date(),
      options: this.props.options,
    };
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  componentDidUpdate(){
    this.setState({
      options: this.props.options
    })
  }

  shouldComponentUpdate(nextProps){
    return this.state.options !== nextProps.options;
  }

  handleDateChange(date){
    this.setState({
      date: date
    }, () => {
      this.props.onSelect();
    });
  }

  handleRefresh(){
    this.props.onSelect();
  }

  render(){
    return(
      <div className="bottom-bar">
        <div className="select">
          <Select 
            menuPlacement="top"
            options={this.state.options}
            placeholder="Select Namespace.."
            onChange={(e) => this.props.handleNamespaceChange(e)}
            theme={theme => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: theme.colors.neutral60,
                primary50: theme.colors.neutral40,
                primary25: theme.colors.neutral20
              }
            })}
            isClearable
          />
        </div>
        <div className="date-picker">
          <span onClick={this.handleRefresh} className="refresh">
            <i className="fa fa-refresh fa-lg"/>
          </span>
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
