import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import BudgetDetails from './components/BudgetDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/budget/:id" element={<BudgetDetails />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;