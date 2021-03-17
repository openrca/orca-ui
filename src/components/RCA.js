import React from 'react';
import axios from 'axios';
import Loader from 'react-loader-spinner';
import queryString from 'query-string';

export class RCA extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      source: null,
      time_point: null,
      loading: true,
      rca: null,
      //Same format as in /v1/graph endpoint
      graphData: null
    };
  }

  componentDidMount() {
    this.handleQueryParams();
  }

  handleQueryParams() {
    const params = queryString.parse(this.props.location.search)
    
    this.setState({
      source: params.source,
      time_point: params.time_point
    }, () => {
      this.loadData();
    })
  }

  loadData() {
    axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/rca?source=' + this.state.source + '&time_point=' + this.state.time_point)
      .then((response) => {
        this.setState({
          rca: response.data,
          loading: false
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return(
      <div>
        <span className="loader">
          <Loader type="TailSpin" visible={this.state.loading} color='#343a40' />
        </span>
      </div>
    );
  }
}
