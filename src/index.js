import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Home, Navbar, Graph } from './components';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/ui.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const router = (
  <div className="wrapper">
    <Navbar />
    <div className="main-panel">
      <Router>
        <Route exact path="/" component={Home} />
        <Route path="/graph" component={Graph} />
      </Router>
    </div>
  </div>
);

ReactDOM.render(router, document.getElementById('root'));
