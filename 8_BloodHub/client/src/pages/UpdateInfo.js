import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  axios.defaults.withCredentials = true; //use this for authentication
  let navigate = useNavigate();

  const [first_name, set_first_name] = useState("");
  const [middle_name, set_middle_name] = useState("");
  const [last_name, set_last_name] = useState("");
  const [email, set_email] = useState("");
  const [cnic, set_CNIC] = useState("");
  const [password, set_password] = useState("");
  const [phone_num, set_phone_num] = useState("");
  const [city, set_city] = useState("islamabad");
  const [blood_type, set_blood_type] = useState("A+");
  const [city_list, set_city_list] = useState([]);
  const [blood_list, set_blood_list] = useState([]);

  const [age, set_age] = useState("");
  const [weight, set_weight] = useState("");
  const [height, set_height] = useState("");

  const [user_data, set_user_data] = useState(""); //use this for authentications
  const [page_loaded, set_page_loaded] = useState(false);

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
        console.log(response.data.user_data);
        set_first_name(response.data.user_data["First_Name"]);
        set_middle_name(response.data.user_data["Middle_Name"]);
        set_last_name(response.data.user_data["Last_Name"]);
        set_email(response.data.user_data["Email"]);
        set_CNIC(response.data.user_data["CNIC"]);
        set_phone_num(response.data.user_data["Phone_Number"]);
        set_city(response.data.user_data["City"]);
        set_blood_type(response.data.user_data["Blood_Group"]);
        set_age(response.data.user_data["Age"]);
        set_weight(response.data.user_data["Weight"]);
        set_height(response.data.user_data["Height"]);

        set_page_loaded(true);
      }
    });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:3001/get_cities").then((fetched_cities) => {
      set_city_list(fetched_cities.data);
    });

    axios.get("http://localhost:3001/get_blood").then((fetched_blood) => {
      set_blood_list(fetched_blood.data);
    });
  }, []);

  const [missing_err, set_missing_err] = useState("");
  const submitForm = (e) => {
    set_missing_err("");
    if (
      first_name != "" &&
      last_name != "" &&
      // email != "" &&
      // cnic != "" &&
      phone_num != "" &&
      // city != "" &&
      // blood_type != "" &&
      age != "" &&
      weight != "" &&
      height != ""
    ) {
      axios
        .post("http://localhost:3001/updateInfo", {
          fname: first_name,
          mname: middle_name,
          lname: last_name,
          u_cnic: cnic,
          password: password,
          pnum: phone_num,
          age: age,
          weight: weight,
          height: height,
        })
        .then((response) => {
          alert(response.data.msg);
        });
    } else {
      set_missing_err("Enter all required fields");
    }
    // axios.post("http://localhost:3001/signup", {
    //     fname: first_name,
    //     mname: middle_name,
    //     lname: last_name,
    //     email: email,
    //     cnic: cnic,
    //     password: password,
    //     pnum: phone_num,
    //     city: city,
    //     bgrp: blood_type,
    //     age: age,
    //     weight: weight,
    //     height: height,
    //     cond1: medical_condition1,
    //     cond2: medical_condition2,
    //     cond3: medical_condition3

    // }).then(() => {
    //     alert("submitted")
    // });
    // // e.preventDefault()
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
                  Donor's dropdown
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="/ViewRequests">
                      View Requests
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/ViewDonationHistory">
                      View Donation History
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
                    <a className="dropdown-item" href="/UpdateInfo">
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
      <div className="sign-up ">
        <h2>Update Info</h2>

        <div className="mb-3 input-box">
          <label>First Name</label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter First Name "
            value={first_name}
            name="first_name"
            onChange={(e) => {
              // console.log(e.target.value)
              set_first_name(e.target.value);
              // console.log(first_name)
            }}
            required
          />
        </div>
        <div className="mb-3 input-box">
          <label>Middle Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Middle Name "
            value={middle_name}
            name="middle_name"
            onChange={(e) => {
              set_middle_name(e.target.value);
            }}
          />
        </div>
        <div className="mb-3 input-box">
          <label>Last Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Last Name"
            value={last_name}
            name="last_name"
            onChange={(e) => {
              set_last_name(e.target.value);
            }}
            required
          />
        </div>
        <div className="mb-3 input-box">
          <label>Email address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            name="email"
            // onChange={(e) => {
            //   set_email(e.target.value);
            // }}
            // required
            disabled
          />
        </div>
        <div className="mb-3 input-box">
          <label>CNIC</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter CNIC"
            value={cnic}
            name="CNIC"
            // onChange={(e) => {
            //   set_CNIC(e.target.value);
            // }}
            // required
            disabled
          />
        </div>

        <div className="mb-3 input-box">
          <label>Enter Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            name="password"
            onChange={(e) => {
              set_password(e.target.value);
            }}
          />
        </div>
        <div className="mb-3 input-box">
          <label>Phone Number</label>
          <input
            type="number"
            className="form-control"
            placeholder="format: 03xxxxxxxxx"
            value={phone_num}
            name="phone_number"
            onChange={(e) => {
              set_phone_num(e.target.value);
            }}
            required
          />
        </div>
        <div className="mb-3 input-box">
          <label>Age</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter Age"
            value={age}
            name="age"
            onChange={(e) => {
              set_age(e.target.value);
            }}
            required
          />
        </div>

        <div className="mb-3 input-box">
          <label>Weight</label>
          <input
            type="number"
            step=".01"
            className="form-control"
            placeholder="Enter Weight"
            value={weight}
            name="weight"
            onChange={(e) => {
              set_weight(e.target.value);
            }}
            required
          />
        </div>

        <div className="mb-3 input-box">
          <label>Height</label>
          <input
            type="number"
            step=".01"
            className="form-control"
            placeholder="Enter Height"
            value={height}
            name="height"
            onChange={(e) => {
              set_height(e.target.value);
            }}
            required
          />
        </div>
        <div className="mb-3 input-box">
          <label>city</label>
          <input
            type="text"
            className="form-control"
            // placeholder="Enter Last Name"
            value={city}
            name="city_name"
            // onChange={(e) => {
            //   set_last_name(e.target.value);
            // }}
            // required
            disabled
          />
        </div>
        <div className="mb-3 input-box">
          <label>Blood Group</label>
          <input
            type="text"
            className="form-control"
            // placeholder="Enter Last Name"
            value={blood_type}
            name="city_name"
            // onChange={(e) => {
            //   set_last_name(e.target.value);
            // }}
            // required
            disabled
          />
        </div>
        {/* <div className="mb-3 input-box">
          <label>City</label>
          <div className="select-container">
            <select
              value={city}
              onChange={(e) => {
                set_city(e.target.value);
              }}
            >
              {city_list.map((c) => (
                <option value={c.City}>{c.City}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3 input-box">
          <label>Blood type</label>
          <div className="select-container">
            <select
              value={blood_type}
              onChange={(e) => {
                set_blood_type(e.target.value);
              }}
            >
              {blood_list.map((obj) => (
                <option value={obj.Blood_Group}>{obj.Blood_Group}</option>
              ))}
            </select>
          </div>
        </div> */}
        <div className="d-grid">
          <button className="btn btn-primary" onClick={submitForm}>
            Submit
          </button>
        </div>
        <div>{missing_err}</div>
      </div>
    </div>
  );
}
