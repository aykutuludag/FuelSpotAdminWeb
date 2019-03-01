import React from 'react';
import ReactDOM from 'react-dom';
import FuelSpot_ADMIN from './App';
import * as serviceWorker from './serviceWorker';
import '../node_modules/underscore/underscore-min.js';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './index.css';
// Add these imports - Step 1
import {Provider} from 'react-redux';
import {store} from './redux';

ReactDOM.render(
    <Provider store={store}>
        <FuelSpot_ADMIN/>
    </Provider>,
    document.getElementById('FUELSPOT_VIEW')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

