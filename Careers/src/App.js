import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JobList from "./components/JobList";
import JobDetails from "./components/JobDetails";
import ApplyForm from "./components/ApplyForm";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/apply/:id" element={<ApplyForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
