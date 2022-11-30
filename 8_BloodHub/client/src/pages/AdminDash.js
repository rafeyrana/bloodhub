import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDash() {
  axios.defaults.withCredentials = true; //use this for authentication
  let navigate = useNavigate();

  const [admin_data, set_admin_data] = useState("");
  const [page_loaded, set_page_loaded] = useState(false);
  const [not_approved_list, set_not_approved_list] = useState([]);

  useEffect(() => {
    //use this for authentication
    axios.get("http://localhost:3001/checkIfAdminLoggedIn").then((response) => {
      console.log("in admin dashboard", response.data);
      if (response.data.loggedIn === false) {
        navigate("/");
      } else if (response.data.admin_data.Admin !== 1) {
        navigate("/");
      } else {
        set_admin_data(response.data.admin_data);
        set_page_loaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (admin_data["Admin"] == 1) {
      fetchNotAprroved();
    }
  }, [page_loaded]);

  const fetchNotAprroved = () => {
    console.log("gonna fetch not approved users here");
    axios.get("http://localhost:3001/getNotAprrovedList").then((response) => {
      set_not_approved_list(response.data);
      console.log(response.data);
    });
  };

  const approveUserFunc = (e) => {
    var parent = e.target.parentNode;
    let approve_cnic = parent.className;
    // console.log(approve_cnic)
    const details = { u_cnic: approve_cnic };
    axios
      .post("http://localhost:3001/approveUser", details)
      .then((response) => {
        fetchNotAprroved();
      });
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="/AdminDash">
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
                  {/* <li><a className="dropdown-item" href="#">Update Profile</a></li> */}
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
      <div>Admin: {admin_data["First_Name"]}</div>
      <div className="approveUsersList">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Blood Group</th>
              <th scope="col">Medical Conditions</th>
              <th scope="col">City</th>
              <th scope="col">CNIC</th>
              <th scope="col">Phone Number</th>
              <th scope="col">Age</th>
              <th scope="col">Height</th>
              <th scope="col">Weight</th>
              <th></th>

              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {not_approved_list.map((row) => (
              <tr>
                <td>
                  {row.First_Name} {row.Middle_Name} {row.Last_Name}
                </td>
                <td>{row.Blood_Group}</td>
                <td>
                  <ul>
                    {row.user_conditions.map((c) => (
                      <li>{c}</li>
                    ))}
                  </ul>
                </td>
                <td>{row.City}</td>
                <td className="donor_cnic">{row.CNIC}</td>
                <td>{row.Phone_Number}</td>
                <td>{row.Age}</td>
                <td>{row.Height}</td>
                <td>{row.Weight}</td>
                <td className={row.CNIC}>
                  <button
                    className="btn btn-primary"
                    value={row.CNIC}
                    onClick={approveUserFunc}
                  >
                    Apporve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
