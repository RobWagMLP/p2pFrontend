import React from 'react';
import './App.css';
import * as dotenv from "dotenv";
import { RouteComponent } from './Components/RouteComponent';
import {Window, Footer} from './Style/baseStyle.css'

dotenv.config({ path: '.env' });

function App() {
  return (
    <div className="App">
      <Window>
        <RouteComponent />
      </Window>
      <Footer />
    </div>
  );
}

export default App;
