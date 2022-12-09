import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function RequestBlood() {
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

  const [broadcast_message, set_broadcast_message] = useState("");

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
        set_broadcast_bgroup(response.data.user_data["Blood_Group"]); //////////////////////////////
        set_page_loaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (city !== "") {
      requestFormSubmit();
    }
  }, [page_loaded]);

  const [city_list, set_city_list] = useState([]);
  const [blood_list, set_blood_list] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/get_cities").then((fetched_cities) => {
      set_city_list(fetched_cities.data);
    });

    axios.get("http://localhost:3001/get_blood").then((fetched_blood) => {
      set_blood_list(fetched_blood.data);
    });
  }, []);

  const [age_err, set_age_err] = useState("");

  const requestFormSubmit = () => {
    // console.log("clicked")
    console.log(city);
    console.log(b_group);
    console.log(l_age);
    console.log(u_age);
    console.log(user_cnic);
    if (parseInt(l_age) < 0 || parseInt(u_age) < 0) {
      set_age_err("please enter a number greater than 0");
      return;
    } else if (parseInt(l_age) > 200 || parseInt(u_age) > 200) {
      set_age_err("please enter a number lesser than 200");
      return;
    } else if (l_age != "" && u_age != "") {
      if (parseInt(l_age) > parseInt(u_age)) {
        set_age_err("lower age limit should be lesser than upper age limit");
        return;
      }
    }

    set_age_err("");
    axios
      .post("http://localhost:3001/requestBloodList", {
        city: city,
        b_group: b_group,
        l_age: l_age,
        u_age: u_age,
        user_cnic: user_cnic,
      })
      .then((response) => {
        console.log(response.data[0]);
        set_brl(response.data);
      });
  };

  const [broadcast_bgroup, set_broadcast_bgroup] = useState("");
  const [empty_message, set_empty_message] = useState("");
  const broadcast_message_submit = () => {
    console.log(broadcast_message);
    console.log(broadcast_bgroup);
    if (broadcast_message == "") {
      set_empty_message("please enter message");
      console.log(empty_message);
      return;
    }

    set_empty_message("");
    axios
      .post("http://localhost:3001/postBroadcast", {
        u_cnic: user_cnic,
        b_grp: broadcast_bgroup,
        b_msg: broadcast_message,
      })
      .then((response) => {
        alert(response.data.msg);
      });
  };

  //need to update this function on backend
  //prevent request if users counter limit has exceeded
  //return with a message informing user that they have reahed their limit
  // will write it later :)
  const requestBloodFromUser = (e) => {
    var parent = e.target.parentNode;
    // var get_donor_cnic = .querySelector('.donor_cnic');
    // console.log(get_donor_cnic)
    // console.log(e)
    let requested_donor_cnic = parent.className;
    // console.log(requested_donor_cnic);
    console.log(user_data["CNIC"]);
    // console.log("need to implement this :)");
    const details = { r_cnic: user_data["CNIC"], d_cnic: requested_donor_cnic };
    axios
      .post("http://localhost:3001/postRequest", details)
      .then((response) => {
        if (response.data.error) alert(response.data.error);
        else alert(response.data);
      });
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="/userDash">
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
        Request Blood page, current user: {user_data["First_Name"]} with cnic:{" "}
        {user_data["CNIC"]}
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
            <div className="mb-3">
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
            </div>
            {}

            <button className="btn btn-primary" onClick={requestFormSubmit}>
              Filter
            </button>
          </div>
        </div>
        <div className="requestBloodList">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Blood Group</th>
                <th scope="col">City</th>
                <th scope="col">CNIC</th>
                <th scope="col">Phone Number</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {blood_req_list.map((row) => (
                <tr value={row.CNIC}>
                  <td>
                    {row.First_Name} {row.Middle_Name} {row.Last_Name}
                  </td>
                  <td>{row.Blood_Group}</td>
                  <td>{row.City}</td>
                  <td className="donor_cnic">{row.CNIC}</td>
                  <td>{row.Phone_Number}</td>
                  <td className={row.CNIC}>
                    <button
                      className="btn btn-primary"
                      value={row.CNIC}
                      onClick={requestBloodFromUser}
                    >
                      Request
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="postBroadcastMessage">
        <h3>Broadcast message</h3>
        <div className="mb-3">
          <label>Enter Message:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter message"
            name="broadcast_message"
            onChange={(e) => {
              set_broadcast_message(e.target.value);
            }}
          />
        </div>
        <div className="mb-3 input-box">
          <label>Blood Group</label>
          <div className="select-container">
            <select
              value={broadcast_bgroup}
              onChange={(e) => {
                set_broadcast_bgroup(e.target.value);
              }}
            >
              {blood_list.map((c) => {
                if (c.Blood_Group == broadcast_bgroup) {
                  // console.log(c.City)
                  return (
                    <option value={c.Blood_Group} selected>
                      {c.Blood_Group}
                    </option>
                  );
                }
                //   console.log(city)
                return <option value={c.Blood_Group}>{c.Blood_Group}</option>;
              })}
            </select>
          </div>
          <div className="form-text">{empty_message}</div>
          <button
            className="btn btn-primary"
            onClick={broadcast_message_submit}
          >
            Post Message
          </button>
        </div>
      </div>
    </div>
  );
}
