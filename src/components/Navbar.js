import React from 'react';
import logo from 'assets/svg/logo.svg';
import { Navbar, Nav, Badge } from 'react-bootstrap';
import axios from 'axios';

import './Navbar.scss';

export class NavbarComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      alertCount: null
    };
    this.alertCountInterval = this.alertCountInterval.bind(this);
  }

  componentDidMount() {
    this.alertCountInterval();
    setInterval(this.alertCountInterval, 30000);
  }

  alertCountInterval() {
    axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/alerts')
      .then((response) => {
        this.setState({
          alertCount: response.data.length
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">
          <img src={logo} className="navbar-logo" alt="logo" />
          OpenRCA
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/graph">Graph</Nav.Link>
            <Nav.Link href="/alerts">
                Alerts
              <Badge className="alertBadge" variant="danger" pill>{this.state.alertCount ? this.state.alertCount : null}</Badge>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
