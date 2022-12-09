const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const e = require("express");
const util = require("util");

// authentication
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"], // give url for frontend here
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// initialising session
app.use(
  session({
    key: "userCookie",
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 1000 * 60 * 60 * 2,
    },
  })
);

let session_var = null;
// session info will be maintained in this

const connection = mysql.createConnection({
  password: "NewPassword",
  host: "localhost",
  user: "root",
  database: "tester",
});

connection.connect((err) => {
  if (err) throw err;
  else console.log("Connected to MySQL successfully.");
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//signup

app.get("/get_cities", async (req, res) => {
  const cities_querry = "select * from cities;";
  connection.query(cities_querry, (err, output) => {
    // console.log(output)
    res.send(output);
  });
});

app.get("/get_blood", async (req, res) => {
  const cities_querry = "select * from blood_types;";
  connection.query(cities_querry, (err, output) => {
    // console.log(output)
    res.send(output);
  });
});

app.post("/signup", async (req, res) => {
  let {
    fname,
    mname,
    lname,
    email,
    cnic,
    password,
    pnum,
    city,
    bgrp,
    age,
    weight,
    height,
    cond1,
    cond2,
    cond3,
  } = req.body;

  conditions = [cond1, cond2, cond3];

  bcrypt.hash(password, 10, (err, hashed_password) => {
    if (err) console.log(err);
    else {
      connection.query(
        `SELECT count(*) as count from users where cnic = "${cnic}" or email = "${email}"`,
        (err, res) => {
          if (err) {
            console.log(err);
          } else {
            if (res[0].count == 0) {
              let user_query = `INSERT INTO users (CNIC,Email ,Password ,Phone_Number ,First_Name ,Middle_Name ,Last_Name ,Approved ,Receiver_Request_Counter ,Admin,City)
              values("${cnic}","${email}","${hashed_password}","${pnum}","${fname}","${mname}","${lname}",0,0,0,"${city}");`;
              // console.log(user_query)
              user_query = user_query.replace(/""/g, "NULL");
              // console.log(user_query)
              connection.query(user_query, (err, result) => {
                if (err) {
                  connection.query(`DELETE FROM users where CNIC = "${cnic}"`);
                } else {
                  connection.query(
                    `INSERT INTO medical_records (Age, Weight, Height, CNIC, Blood_Group) values(${age},${weight},${height},"${cnic}","${bgrp}");`,
                    (err, result) => {
                      if (err) console.log(err);
                      else {
                        for (c in conditions) {
                          if (conditions[c].length === 0) continue;
                          connection.query(
                            `INSERT INTO medical_conditions (user_condition, CNIC) values("${conditions[c]}","${cnic}")`,
                            (err, mc_result) => {
                              if (err) console.log("error in mc");
                              else console.log("mc  inserted");
                            }
                          );
                        }
                      }
                    }
                  );
                }
              });
            } else {
              console.log("a user with these credentials already exists");
            }
          }
        }
      );
    }
  });
});

///////////////////////////////////////////////////////////////////////////////////
// login
app.post("/login", async (req, res) => {
  let { user_email, user_password } = req.body;
  // console.log(user_email,user_password)

  connection.query(
    `select * from users join medical_records on users.CNIC = medical_records.CNIC WHERE users.email = '${user_email}'`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.length == 0) {
          console.log("no such user exists");
          res.send({ error: "no such user exists" });
        } else {
          // console.log(res[0].Password)
          bcrypt.compare(
            user_password,
            result[0].Password,
            async (err, comparison_result) => {
              if (err) {
                console.log(err);
              } else {
                if (comparison_result) {
                  if (result[0].Approved == 1) {
                    console.log("login successful");

                    req.session.user = result[0];
                    // session_var = req.session.user
                    // console.log(req.session.user)
                    // console.log(req.session.user)

                    res.send({ success: "login successful" });
                  } else {
                    console.log("account not approved");
                    res.send({ error: "account not approved" });
                  }
                } else {
                  console.log("incorrect password");
                  res.send({ error: "incorrect password" });
                }
              }
            }
          );
        }
      }
    }
  );
});

app.post("/loginAdmin", async (req, res) => {
  let { user_email, user_password } = req.body;

  console.log("admin login");

  connection.query(
    `select * from users  WHERE users.email = '${user_email}' and Admin = 1`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.length == 0) {
          console.log("no such admin exists");
          res.send({ error: "no such admin exists" });
        } else {
          bcrypt.compare(
            user_password,
            result[0].Password,
            async (err, comparison_result) => {
              if (err) {
                console.log(err);
              } else {
                if (comparison_result) {
                  if (result[0].Admin == 1) {
                    console.log("login successful");

                    req.session.user = result[0];
                    // session_var = req.session.user
                    // console.log(req.session.user)
                    // console.log(req.session.user)

                    res.send({ success: "login successful" });
                  } else {
                    console.log("not admin");
                    res.send({ error: "not admin" });
                  }
                } else {
                  console.log("incorrect password");
                  res.send({ error: "incorrect password" });
                }
              }
            }
          );
        }
      }
    }
  );
});

///////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
// authenthicating, call this function for each to check if the user exists
// and get info about the user
app.get("/checkIfLoggedIn", (req, res) => {
  console.log("here");

  // console.log("ses",session_var)
  console.log("req", req.session.user);
  if (req.session.user != null) {
    res.send({ loggedIn: true, user_data: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
  // if(session_var!=null){
  //     res.send({loggedIn: true, user_data: session_var})
  // }
  // else{
  //     res.send({loggedIn: false})
  // }
});

app.get("/checkIfAdminLoggedIn", (req, res) => {
  console.log("checking admin here");

  // console.log("ses",session_var)
  // console.log("req", req.session.user);
  if (req.session.user != null) {
    if (req.session.user.Admin == 1) {
      res.send({ loggedIn: true, admin_data: req.session.user });
    } else {
      // users exists in session but isnt an admin
      res.send({ loggedIn: false });
    }
  } else {
    res.send({ loggedIn: false });
  }
  // if(session_var!=null){
  //     res.send({loggedIn: true, user_data: session_var})
  // }
  // else{
  //     res.send({loggedIn: false})
  // }
});

//////////////////////////////////////////////////////////////////////////////////
// called from navbar, inlcude navbar in each page
app.get("/logout", (req, res) => {
  console.log("logging out");
  req.session.user = null;
  console.log("req", req.session.user);
  if (req.session.user == null) {
    res.send({ loggedOut: true });
  }
});

////////////////////////////////////////////
// request blood page

app.post("/requestBloodList", (req, res) => {
  console.log("fetching list");
  let { city, b_group, l_age, u_age, user_cnic } = req.body;

  if (l_age == "") {
    l_age = "1";
  }
  if (u_age == "") {
    u_age = "200";
  }

  connection.query(
    `select * from users join medical_records on users.CNIC = medical_records.CNIC where users.city = "${city}" and medical_records.age BETWEEN ${l_age} AND ${u_age} and users.cnic != "${user_cnic}" and users.Approved = 1 and  medical_records.last_donated < DATE_SUB(CURDATE(), INTERVAL 56 DAY) AND medical_records.blood_group = '${b_group}';`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

///////////////////////////////////////////////////

////////////////////////////////////////////
// View Requests Page

app.post("/ViewRequests", async (req, res) => {
  console.log("fetching list123");
  const { temp_cnic } = req.body;
  console.log("BACCKEND ");
  console.log(temp_cnic);
  connection.query(
    `select * from users join blood_requests on blood_requests.receiver_cnic = users.cnic where blood_requests.donor_cnic = '${temp_cnic}' and Pending_Accepted = 0;`,

    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.post("/AcceptRequest", async (req, res) => {
  console.log("fetching list");
  const { r_cnic, d_cnic } = req.body;
  connection.query(
    `UPDATE Blood_Requests SET Pending_Accepted = 1 WHERE Receiver_CNIC = '${r_cnic}' and Donor_CNIC = '${d_cnic}';`,

    (err) => {
      if (err) {
        console.log(err);
      } else {
        res.json("Accepted");
      }
    }
  );
});

app.post("/RejectRequest", async (req, res) => {
  console.log("fetching list");
  const { r_cnic, d_cnic } = req.body;
  connection.query(
    `UPDATE Blood_Requests SET Pending_Accepted = 3 WHERE Receiver_CNIC = '${r_cnic}' and Donor_CNIC = '${d_cnic}';`,

    (err) => {
      if (err) {
        console.log(err);
      } else {
        res.json("Rejected");
      }
    }
  );
});

app.post("/ViewDonationHistory", async (req, res) => {
  console.log("fetching list123");
  const { temp_cnic } = req.body;
  console.log("BACCKEND ");
  console.log(temp_cnic);
  connection.query(
    `select * from users join blood_requests on blood_requests.receiver_cnic = users.cnic where blood_requests.donor_cnic = '${temp_cnic}' and Pending_Accepted = 1;`,

    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.post("/PendingRequests", async (req, res) => {
  console.log("fetching list123");
  const { temp_cnic } = req.body;
  console.log("BACCKEND ");
  console.log(temp_cnic);
  connection.query(
    `select * from users join blood_requests on blood_requests.donor_cnic = users.cnic where blood_requests.receiver_cnic = '${temp_cnic}' and Pending_Accepted = 0;`,

    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.post("/UnsendRequest", async (req, res) => {
  console.log("fetching list");
  const { r_cnic, d_cnic } = req.body;
  connection.query(
    `UPDATE Blood_Requests SET Pending_Accepted = 3 WHERE Receiver_CNIC = '${r_cnic}' and Donor_CNIC = '${d_cnic}';`,

    (err) => {
      if (err) {
        console.log(err);
      } else {
        connection.query(
          `update users set Receiver_Request_Counter = Receiver_Request_Counter - 1 WHERE CNIC = '${r_cnic}';`,

          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
        res.json("Unsent");
      }
    }
  );
});

app.post("/ReceivedDonations", async (req, res) => {
  console.log("fetching list123");
  const { temp_cnic } = req.body;
  console.log("BACCKEND ");
  console.log(temp_cnic);
  connection.query(
    `select * from users join blood_requests on blood_requests.donor_cnic = users.cnic where blood_requests.receiver_cnic = '${temp_cnic}' and Pending_Accepted = 0;`,

    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

///////////////////////////////////////////////////

//admin page
// fetching not approved users
app.get("/getNotAprrovedList", async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);
  const res1 = await query(
    "select * from users as u join medical_records as mr on u.CNIC = mr.CNIC where u.Admin=0 and u.Approved=0;"
  );
  await Promise.all(
    res1.map(async (entry) => {
      conditions = await query(
        `select user_condition from medical_conditions where CNIC = "${entry.CNIC}";`
      );
      let conditions_list = [];
      for (j in conditions) {
        conditions_list.push(conditions[j].user_condition);
      }
      entry["user_conditions"] = conditions_list;
    })
  );
  console.log(res1);
  res.json(res1);
});

app.post("/postRequest", async (req, res) => {
  const { d_cnic, r_cnic } = req.body;
  const query = util.promisify(connection.query).bind(connection);
  const rows = await query(`select * from users where CNIC = '${r_cnic}';`);
  result = rows[0];
  if (result["Receiver_Request_Counter"] >= 5) {
    res.json({ error: "Request Limit Reached" });
    return;
  } else {
    await query(
      `INSERT INTO blood_requests (Pending_Accepted, Donor_CNIC, Receiver_CNIC) VALUES (0, '${d_cnic}', '${r_cnic}');`
    );
    await query(
      `update users set Receiver_Request_Counter = Receiver_Request_Counter + 1 WHERE CNIC = '${r_cnic}' ;`
    );
    res.json("Request Sent");
  }
  return;
});

app.post("/approveUser", async (req, res) => {
  const { u_cnic } = req.body;
  const query = util.promisify(connection.query).bind(connection);
  await query(`update users set Approved = 1 where cnic = '${u_cnic}';`);
  res.json("Approved");
});

app.post("/postBroadcast", async (req, res) => {
  const { u_cnic, b_grp, b_msg } = req.body;
  const query = util.promisify(connection.query).bind(connection);
  const count = await query(
    `select count(*) from tester.broadcast_list where cnic = '${u_cnic}' and date(date) = current_date() and (HOUR(date) > HOUR(current_timestamp())-1);`
  );
  const posted = count[0]["count(*)"];
  console.log(posted);
  if (posted >= 5) {
    res.json({ msg: "Broadcast Limit Reached" });
    return;
  } else {
    await query(
      `INSERT INTO broadcast_list (Message, CNIC, Blood_Group) VALUES ('${b_msg}', '${u_cnic}', '${b_grp}');`
    );
    res.json({ msg: "Message Broadcasted" });
    return;
  }
});

app.get("/getBroadcastList", async (req, res) => {
  const query = util.promisify(connection.query).bind(connection);
  const rows = await query(
    `SELECT bl.Message, bl.Blood_Group, users.Phone_Number, users.City FROM broadcast_list as bl join users on bl.CNIC = users.CNIC order by date;`
  );
  console.log("HERE");
  res.json(rows);
});

app.post("/viewAdminDonationHistory", async (req, res) => {
  const { city, b_group } = req.body;
  let qry1 = `select  br.Donor_CNIC, br.Receiver_CNIC, mr.blood_group, br.date, users.city from blood_requests as br join medical_records as mr on br.Donor_CNIC = mr.CNIC join users on br.Receiver_CNIC = users.CNIC WHERE Pending_Accepted = 1 `;
  if (city != "all") {
    qry1 += `AND city = '${city}' `;
  }
  if (b_group != "all") {
    qry1 += `AND Blood_Group = '${b_group}' `;
  }
  qry1 += " order by br.date";
  qry1 += `;`;
  const query = util.promisify(connection.query).bind(connection);
  const rows = await query(qry1);
  res.json(rows);
});

app.post("/updateInfo", async (req, res) => {
  const { fname, mname, lname, password, pnum, age, weight, height, u_cnic } =
    req.body;
  const query = util.promisify(connection.query).bind(connection);
  if (password == "") {
    let user_query = `UPDATE users SET First_Name = '${fname}', Middle_Name = '${mname}', Last_Name = '${lname}', Phone_Number = '${pnum}' WHERE CNIC = '${u_cnic}';`;
    user_query = user_query.replace(/''/g, "NULL");
    console.log(user_query);
    await query(user_query);
    let med_query = `UPDATE medical_records SET Age = '${age}', Weight = '${weight}', Height = '${height}' WHERE CNIC = '${u_cnic}';`;
    await query(med_query);
  } else {
    bcrypt.hash(password, 10, async (err, hashed_pass) => {
      if (err) console.log(err);
      else {
        let user_query = `UPDATE users SET First_Name = '${fname}', Middle_Name = '${mname}', Last_Name = '${lname}', Phone_Number = '${pnum}', Password = '${hashed_pass}' WHERE CNIC = '${u_cnic}';`;
        user_query = user_query.replace(/''/g, "NULL");
        await query(user_query);
        let med_query = `UPDATE medical_records SET Age = '${age}', Weight = '${weight}', Height = '${height}' WHERE CNIC = '${u_cnic}';`;
        await query(med_query);
        res.json({ msg: "Updated Personal Info" });
      }
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
