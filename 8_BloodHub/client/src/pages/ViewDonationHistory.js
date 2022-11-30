import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function ViewDonationHistory() {
  axios.defaults.withCredentials = true; //use this for authentication
  let navigate = useNavigate();

  const [user_data, set_user_data] = useState(""); //use this for authentications

  const [city, set_city] = useState("");
  const [b_group, set_b_group] = useState("");
  const [l_age, set_l_age] = useState("");
  const [u_age, set_u_age] = useState("");

  const [user_cnic, set_cnic] = useState("");

  const [blood_req_list, set_brl] = useState([]);
  const [page_loaded, set_page_loaded] = useState(false); //dont change its value in the code!

  useEffect(() => {
    //use this for authentication
    axios.get("http://localhost:3001/checkIfLoggedIn").then((response) => {
      console.log("in userdashboard", response.data);
      if (response.data.loggedIn === false) {
        navigate("/");
      } else if (response.data.user_data.Approved !== 1) {
        navigate("/");
      } else {
        set_user_data(response.data.user_data);
        set_city(response.data.user_data["City"]);
        set_b_group(response.data.user_data["Blood_Group"]);
        set_cnic(response.data.user_data["CNIC"]);
        set_page_loaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (city !== "") {
      requestFormSubmit();
    }
  }, [page_loaded]);

  const requestFormSubmit = () => {
    const manhoos = {temp_cnic: user_cnic};

    axios
      .post("http://localhost:3001/ViewDonationHistory", manhoos)
      .then((response) => {
        set_brl(response.data);
      });
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Blood Hub
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  aria-current="page"
                  href="/userDash"
                >
                  User Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  copy_this_div_for_links
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Receiver's dropdown
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="/PendingRequests">
                      Pending/Cancel Requests
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/ReceivedDonations">
                      Received Donations
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/RequestBlood">
                      Request Blood
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Donor's dropdown
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="/ViewRequests">View Requests</a></li>
                                    <li><a className="dropdown-item" href="/ViewDonationHistory">View Donation History</a></li>
                                </ul>
                            </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  settings
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="#">
                      Update Profile
                    </a>
                  </li>
                  {/* <li><a className="dropdown-item" href="#">Another action</a></li> */}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      onClick={() => {
                        // console.log("clicked")
                        axios
                          .get("http://localhost:3001/logout")
                          .then((response) => {
                            if (response.data["loggedOut"] == true)
                              navigate("/"); // back to login page
                          });
                      }}
                    >
                      Log out
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div>
        View Donatiion History page, current user: {user_data["First_Name"]} with cnic:{" "}
        {user_data["CNIC"]}
      </div>

      <div className="ViewRequestbox">
        <div className="ViewRequestList">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Name</th>
                <th scope="col">City</th>
                <th scope="col">CNIC</th>
                <th scope="col">Phone Number</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {blood_req_list.map((row) => (
                <tr value={row.CNIC}>
                  <td>{row.date}</td>
                  <td>{row.First_Name} {row.Middle_Name} {row.Last_Name}</td>
                  <td>{row.City}</td>
                  <td className="donor_cnic">{row.CNIC}</td>
                  <td>{row.Phone_Number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}