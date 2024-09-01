import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDash() {
  axios.defaults.withCredentials = true; //use this for authentication
  let navigate = useNavigate();

  const [admin_data, set_admin_data] = useState("");
  const [page_loaded, set_page_loaded] = useState(false);
  const [not_approved_list, set_not_approved_list] = useState([]);

  const [city_list, set_city_list] = useState([]);
  const [blood_list, set_blood_list] = useState([]);
  const [city, set_city] = useState("all");
  const [b_group, set_b_group] = useState("all");

  // const []
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
      searchFormSubmit();
    }
  }, [page_loaded]);

  useEffect(() => {
    axios.get("http://localhost:3001/get_cities").then((fetched_cities) => {
      fetched_cities.data.push({ City: "all" });
      console.log(fetched_cities.data);
      set_city_list(fetched_cities.data);
    });

    axios.get("http://localhost:3001/get_blood").then((fetched_blood) => {
      fetched_blood.data.push({ Blood_Group: "all" });
      console.log(fetched_blood.data);
      set_blood_list(fetched_blood.data);
    });
  }, []);

  const fetchNotAprroved = () => {
    axios.get("http://localhost:3001/getNotAprrovedList").then((response) => {
      set_not_approved_list(response.data);
      console.log(response.data);
    });
  };

  const approveUserFunc = (e) => {
    var parent = e.target.parentNode;
    let approve_cnic = parent.className;
    const details = { u_cnic: approve_cnic };
    axios
      .post("http://localhost:3001/approveUser", details)
      .then((response) => {
        fetchNotAprroved();
      });
  };

  const [donation_list, set_dl] = useState([]);

  const searchFormSubmit = (e) => {
    // console.log("hhhhhh");
    console.log(city);
    console.log(b_group);
    axios
      .post("http://localhost:3001/viewAdminDonationHistory", {
        city: city,
        b_group: b_group,
      })
      .then((response) => {
        console.log(response.data[0]);
        set_dl(response.data);
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
      <div>
        <h4>Donation History</h4>
      </div>
      <div className="requestBloodbox">
        <div className="requestBloodForm">
          <div>
            <div className="mb-3 input-box">
              <label>City</label>
              <div className="select-container">
                <select
                  value={city}
                  onChange={(e) => {
                    set_city(e.target.value);
                  }}
                >
                  {city_list.map((c) => {
                    if (c.City == city) {
                      // console.log(c.City)
                      return (
                        <option value={c.City} selected>
                          {c.City}
                        </option>
                      );
                    }
                    //   console.log(city)
                    return <option value={c.City}>{c.City}</option>;
                  })}
                </select>
              </div>
            </div>
            <div className="mb-3 input-box">
              <label>Blood Group</label>
              <div className="select-container">
                <select
                  value={b_group}
                  onChange={(e) => {
                    set_b_group(e.target.value);
                  }}
                >
                  {blood_list.map((c) => {
                    if (c.Blood_Group == b_group) {
                      // console.log(c.City)
                      return (
                        <option value={c.Blood_Group} selected>
                          {c.Blood_Group}
                        </option>
                      );
                    }
                    //   console.log(city)
                    return (
                      <option value={c.Blood_Group}>{c.Blood_Group}</option>
                    );
                  })}
                </select>
              </div>
            </div>
            {/* <div className="mb-3">
                            <label>Age</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Enter lower limit for age"
                                name="l_age"
                                onChange={(e) => {
                                    set_l_age(e.target.value);
                                }}
                            />
                            <br></br>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Enter upper limit for age"
                                name="u_age"
                                onChange={(e) => {
                                    set_u_age(e.target.value);
                                }}
                            />
                            <div className="form-text">{age_err}</div>

                        </div> */}
            {}

            <button className="btn btn-primary" onClick={searchFormSubmit}>
              Filter
            </button>
          </div>
        </div>
        <div className="requestBloodList">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Donor CNIC</th>
                <th scope="col">Receiver CNIC</th>
                <th scope="col">Blood Type</th>
                <th scope="col">CNIC</th>
              </tr>
            </thead>
            <tbody>
              {donation_list.map((row) => (
                <tr>
                  <td>{row.Donor_CNIC}</td>
                  <td>{row.Receiver_CNIC}</td>
                  <td>{row.blood_group}</td>
                  <td>{row.city}</td>
                  <td>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
