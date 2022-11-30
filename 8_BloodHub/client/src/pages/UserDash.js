import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";

export default function UserDash() {

    axios.defaults.withCredentials = true //use this for authentication
    let navigate = useNavigate();


    const [user_data, set_user_data] = useState('') //use this for authentications

    useEffect(() => { //use this for authentication
        axios.get("http://localhost:3001/checkIfLoggedIn")
            .then((response) => {
                console.log("in userdashboard", response.data)
                if (response.data.loggedIn === false) {
                    navigate("/")
                }
                else if (response.data.user_data.Approved !== 1) {
                    navigate("/")
                }
                else {
                    set_user_data(response.data.user_data)
                }
            })
    }, []);

    console.log("in main",user_data)
    console.log(user_data["First_Name"]) // access data in userdata like this

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">Blood Hub</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="/userDash">User Dashboard</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">copy_this_div_for_links</a>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Receiver's dropdown
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="/PendingRequests">Pending/Cancel Requests</a></li>
                                    <li><a className="dropdown-item" href="/ReceivedDonations">Received Donations</a></li>
                                    <li><a className="dropdown-item" href="/RequestBlood">Request Blood</a></li>
                                    
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
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    settings
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Update Profile</a></li>
                                    {/* <li><a className="dropdown-item" href="#">Another action</a></li> */}
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><a className="dropdown-item" onClick={()=>{
                                       
                                        // console.log("clicked")
                                        axios.get("http://localhost:3001/logout").then((response)=>{
                                        if(response.data["loggedOut"]==true)

                                            navigate("/"); // back to login page
                                        })
                                    }}>Log out</a></li>
                                </ul>
                            </li>
                           
                        </ul>
                        
                    </div>
                </div>
            </nav>

        <div>hello {user_data["First_Name"]}</div>
        </div>
        
    )
}
