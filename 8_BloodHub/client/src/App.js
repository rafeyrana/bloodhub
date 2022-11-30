import "./App.css";
// import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";


import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import UserDash from "./pages/UserDash";
import PendingRequests from "./pages/PendingRequests";
import ReceivedDonations from "./pages/ReceivedDonations";
import RequestBlood from "./pages/RequestBlood";
import AdminDash from "./pages/AdminDash";
import ViewRequests from "./pages/ViewRequests";
import ViewDonationHistory from "./pages/ViewDonationHistory";



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/userDash" element={<UserDash />} />
          <Route path="/PendingRequests" element={<PendingRequests />} />
          <Route path="/ReceivedDonations" element={< ReceivedDonations/>} />
          <Route path="/RequestBlood" element={<RequestBlood />} />
          <Route path="/AdminDash" element={<AdminDash  />} />
          <Route path="/ViewRequests" element={<ViewRequests  />} />
          <Route path="/ViewDonationHistory" element={<ViewDonationHistory  />} />
          
          {/* <Route path="/user" element={<UserDash />} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
