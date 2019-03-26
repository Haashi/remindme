import * as React from 'react';
import Header from '../Header/Header';
import Form from '../Form/Form';
import './App.css';


class App extends React.Component {
  public render() {
    return (
      <div className="app">
        <Header/>
        <div className="container">
        <Form/>
        </div>
        </div>
    );
  }
}

export default App;
