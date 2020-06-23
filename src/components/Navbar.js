import React from 'react';
import logo from './svg/logo.svg';
import { Navbar, Nav } from 'react-bootstrap';
import './Navbar.scss';

export class NavbarComponent extends React.Component {
  render() {
    return (
      <Navbar class="top-navbar d-inline-block align-top" bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">
          <img src={logo} className="navbar-logo" alt="logo" />
          OpenRCA
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/graph">Graph</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
