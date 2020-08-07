import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Home, Navbar, Graph, Alerts } from './components';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/ui.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';

const router = (
  <div className="wrapper">
    <Navbar />
    <div className="main-panel">
      <Router>
        <Route exact path="/" component={Home} />
        <Route path="/graph" component={Graph} />
        <Route path="/alerts" component={Alerts} />
      </Router>
    </div>
  </div>
);

ReactDOM.render(router, document.getElementById('root'));
