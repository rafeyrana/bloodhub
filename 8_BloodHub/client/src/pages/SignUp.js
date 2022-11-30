import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";


export default function SignUp() {


    const [first_name, set_first_name] = useState('')
    const [middle_name, set_middle_name] = useState('')
    const [last_name, set_last_name] = useState('')
    const [email, set_email] = useState('')
    const [cnic, set_CNIC] = useState('')
    const [password, set_password] = useState('')
    const [phone_num, set_phone_num] = useState('')
    const [city, set_city] = useState('islamabad')
    const [blood_type, set_blood_type] = useState('A+')
    const [city_list, set_city_list] = useState([])
    const [blood_list, set_blood_list] = useState([])

    const [age, set_age] = useState('')
    const [weight, set_weight] = useState('')
    const [height, set_height] = useState('')
    const [medical_condition1, set_medical_condition1] = useState('')
    const [medical_condition2, set_medical_condition2] = useState('')
    const [medical_condition3, set_medical_condition3] = useState('')

    useEffect(() => {
        axios.get("http://localhost:3001/get_cities").then((fetched_cities) => {
            set_city_list(fetched_cities.data)
        })


        axios.get("http://localhost:3001/get_blood").then((fetched_blood) => {

            set_blood_list(fetched_blood.data)
        })

    }, [])

    const submitForm = (e) => {
        
        if (first_name != "" && last_name != "" && email != "" && cnic != "" && password != "" && phone_num != "" && city != "" && blood_type != "" && age != "" && weight != "" && height != "") {
            axios.post("http://localhost:3001/signup", {
                fname: first_name,
                mname: middle_name,
                lname: last_name,
                email: email,
                cnic: cnic,
                password: password,
                pnum: phone_num,
                city: city,
                bgrp: blood_type,
                age: age,
                weight: weight,
                height: height,
                cond1: medical_condition1,
                cond2: medical_condition2,
                cond3: medical_condition3



            }).then((response) => {
                console.log(response);
            });
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
            <div>
                <button className="btn btn-danger signup_toggle">
                    <Link to="/"> Log in </Link>
                </button>
            </div>
            <div className='sign-up '>
                <h2>Sign up to Bloodhub</h2>

                <div className="mb-3 input-box">
                    <label>First Name</label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter First Name"
                        name="first_name"
                        onChange={(e) => {
                            // console.log(e.target.value)
                            set_first_name(e.target.value)
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
                        name="middle_name"
                        onChange={(e) => {
                            set_middle_name(e.target.value)
                        }}

                    />
                </div>
                <div className="mb-3 input-box">
                    <label>Last Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Last Name"
                        name="last_name"
                        onChange={(e) => {
                            set_last_name(e.target.value)
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
                        name="email"
                        onChange={(e) => {
                            set_email(e.target.value)
                        }}
                        required
                    />
                </div>
                <div className="mb-3 input-box">
                    <label>CNIC</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Enter CNIC"
                        name="CNIC"
                        onChange={(e) => {
                            set_CNIC(e.target.value)
                        }}
                        required
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
                            set_password(e.target.value)
                        }}
                        required
                    />
                </div>
                <div className="mb-3 input-box">
                    <label>Phone Number</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="format: 03xxxxxxxxx"
                        name="phone_number"
                        onChange={(e) => {
                            set_phone_num(e.target.value)
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
                        name="age"
                        onChange={(e) => {
                            set_age(e.target.value)
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
                        name="weight"
                        onChange={(e) => {
                            set_weight(e.target.value)
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
                        name="height"
                        onChange={(e) => {
                            set_height(e.target.value)
                        }}
                        required
                    />
                </div>
                <div className="mb-3 input-box">
                    <label>Please enter any medical you would like to specify</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="enter medical condtion "
                        name="medical_conditon1"
                        onChange={(e) => {
                            set_medical_condition1(e.target.value)
                        }}

                    />
                    <br></br>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="enter medical condtion "
                        name="medical_conditon2"
                        onChange={(e) => {
                            set_medical_condition2(e.target.value)
                        }}

                    />
                    <br></br>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="enter medical condtion "
                        name="medical_conditon3"
                        onChange={(e) => {
                            set_medical_condition3(e.target.value)
                        }}

                    />
                </div>
                <div className="mb-3 input-box">
                    <label>City</label>
                    <div className="select-container">
                        <select value={city} onChange={(e) => {

                            set_city(e.target.value)

                        }}>
                            {city_list.map((c) => (
                                <option value={c.City}>{c.City}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-3 input-box">
                    <label>Blood type</label>
                    <div className="select-container">
                        <select value={blood_type} onChange={(e) => {

                            set_blood_type(e.target.value)

                        }}>
                            {blood_list.map((obj) => (
                                <option value={obj.Blood_Group}>{obj.Blood_Group}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="d-grid">
                    <button className="btn btn-primary" onClick={submitForm}>Submit</button>
                </div>
            </div>
        </div>

    )
}
