import React from 'react';
import './App.css';  // Importing CSS for overall styling
import SolarSystem from './components/SolarSystem';  // Import the main Solar System component

function App() {
  return (
    <div className="App">
      <main>
        <SolarSystem />  // Main content area where the solar system is rendered
      </main>
    </div>
  );
}

export default App;
