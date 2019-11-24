import '@assets/modernizr-custom';
import AppContext from '@models/AppContext';
import { observable } from 'mobx';
import './styles';

const context: AppContext = observable({
  mapDisabled: false,
});

window.addEventListener('load', () => {
  import('./app').then(({ default: app }) => {
    app(context, document.getElementById('app'));
  });
  import('./map').then(({ default: map }) => {
    map(context, document.getElementById('stage'));
  });
});
