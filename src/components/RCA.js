import React from 'react';
import axios from 'axios';
import Loader from 'react-loader-spinner';

export class RCA extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      id: this.props.match.params.id,
      loading: true,
      rca: null,
      //Same format as in /v1/graph endpoint
      graphData: null
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/rca/' + this.state.id)
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
