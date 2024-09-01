const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const util = require("util");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  key: "userCookie",
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  cookie: { expires: 1000 * 60 * 60 * 2 },
}));

// Database connection
const connection = mysql.createConnection({
  password: "NewPassword",
  host: "localhost",
  user: "root",
  database: "tester",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL successfully.");
});

// Promisify MySQL queries
const query = util.promisify(connection.query).bind(connection);

// Routes
app.get("/get_cities", async (req, res) => {
  const cities = await query("SELECT * FROM cities;");
  res.send(cities);
});

app.get("/get_blood", async (req, res) => {
  const cities_querry = "select * from blood_types;";
  connection.query(cities_querry, (err, output) => {
    res.send(output);
  });
});

app.post("/signup", async (req, res) => {
  const {
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

  const conditions = [cond1, cond2, cond3].filter(Boolean);

  try {
    const existingUser = await query(
      "SELECT COUNT(*) as count FROM users WHERE cnic = ? OR email = ?",
      [cnic, email]
    );

    if (existingUser[0].count > 0) {
      return res.status(409).json({ error: "User with these credentials already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query("START TRANSACTION");

    const userQuery = `
      INSERT INTO users 
      (CNIC, Email, Password, Phone_Number, First_Name, Middle_Name, Last_Name, Approved, Receiver_Request_Counter, Admin, City)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?)
    `;
    await query(userQuery, [cnic, email, hashedPassword, pnum, fname, mname || null, lname, city]);

    const medicalRecordQuery = `
      INSERT INTO medical_records 
      (Age, Weight, Height, CNIC, Blood_Group) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await query(medicalRecordQuery, [age, weight, height, cnic, bgrp]);

    if (conditions.length > 0) {
      const medicalConditionQuery = `
        INSERT INTO medical_conditions 
        (user_condition, CNIC) 
        VALUES ?
      `;
      const conditionValues = conditions.map(condition => [condition, cnic]);
      await query(medicalConditionQuery, [conditionValues]);
    }

    await query("COMMIT");
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    await query("ROLLBACK");
    console.error("Error in signup:", error);
    res.status(500).json({ error: "An error occurred during signup" });
  }
});



app.post("/login", async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    const query = `
      SELECT users.*, medical_records.*
      FROM users
      JOIN medical_records ON users.CNIC = medical_records.CNIC
      WHERE users.email = ?
    `;
    const [results] = await connection.promise().query(query, [user_email]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No such user exists" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(user_password, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    if (user.Approved !== 1) {
      return res.status(403).json({ error: "Account not approved" });
    }

    req.session.user = user;
    res.status(200).json({ success: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});




app.post("/loginAdmin", async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    const [results] = await connection.promise().query(
      'SELECT * FROM users WHERE email = ? AND Admin = 1',
      [user_email]
    );

    if (results.length === 0) {
      console.log("No such admin exists");
      return res.status(404).json({ error: "No such admin exists" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(user_password, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    if (user.Admin !== 1) {
      return res.status(403).json({ error: "Not admin" });
    }

    req.session.user = user;
    res.status(200).json({ success: "Login successful" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "An error occurred during admin login" });
  }
});

app.get("/checkIfLoggedIn", (req, res) => {
  const isLoggedIn = !!req.session.user;
  res.json({
    loggedIn: isLoggedIn,
    user_data: isLoggedIn ? req.session.user : null
  });
});

app.get("/checkIfAdminLoggedIn", (req, res) => {
  const user = req.session.user;
  const isAdminLoggedIn = user && user.Admin === 1;
  res.json({
    loggedIn: isAdminLoggedIn,
    admin_data: isAdminLoggedIn ? user : null
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ loggedOut: true });
  });
});



app.post("/requestBloodList", async (req, res) => {
  try {
    let { city, b_group, l_age, u_age, user_cnic } = req.body;

    // Set default values for age range if not provided
    l_age = l_age || "1";
    u_age = u_age || "200";

    const query = `
      SELECT * FROM users 
      JOIN medical_records ON users.CNIC = medical_records.CNIC 
      WHERE users.city = ? 
        AND medical_records.age BETWEEN ? AND ? 
        AND users.cnic != ? 
        AND users.Approved = 1 
        AND medical_records.last_donated < DATE_SUB(CURDATE(), INTERVAL 56 DAY) 
        AND medical_records.blood_group = ?
    `;

    const [results] = await connection.promise().query(query, [city, l_age, u_age, user_cnic, b_group]);

    res.json(results);
  } catch (error) {
    console.error("Error in requestBloodList:", error);
    res.status(500).json({ error: "An error occurred while fetching blood list" });
  }
});

app.post("/ViewRequests", async (req, res) => {
  try {
    const { temp_cnic } = req.body;
    
    if (!temp_cnic) {
      return res.status(400).json({ error: "CNIC is required" });
    }

    const query = `
      SELECT users.*, blood_requests.*
      FROM users
      JOIN blood_requests ON blood_requests.receiver_cnic = users.cnic
      WHERE blood_requests.donor_cnic = ?
      AND blood_requests.Pending_Accepted = 0
    `;

    const [results] = await connection.promise().query(query, [temp_cnic]);
    res.json(results);
  } catch (error) {
    console.error("Error in ViewRequests:", error);
    res.status(500).json({ error: "An error occurred while fetching requests" });
  }
});

app.post("/AcceptRequest", async (req, res) => {
  try {
    const { r_cnic, d_cnic } = req.body;
    
    if (!r_cnic || !d_cnic) {
      return res.status(400).json({ error: "Both receiver and donor CNIC are required" });
    }

    const query = `
      UPDATE Blood_Requests
      SET Pending_Accepted = 1
      WHERE Receiver_CNIC = ?
      AND Donor_CNIC = ?
      AND Pending_Accepted = 0
    `;

    const [result] = await connection.promise().query(query, [r_cnic, d_cnic]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No matching request found or already processed" });
    }

    res.json({ message: "Request accepted successfully" });
  } catch (error) {
    console.error("Error in AcceptRequest:", error);
    res.status(500).json({ error: "An error occurred while accepting the request" });
  }
});

app.post("/RejectRequest", async (req, res) => {
  const { r_cnic, d_cnic } = req.body;
  connection.query(
    `UPDATE Blood_Requests SET Pending_Accepted = 3 WHERE Receiver_CNIC = '${r_cnic}' and Donor_CNIC = '${d_cnic}' AND Pending_Accepted = 0;`,

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
  const { temp_cnic } = req.body;
  connection.query(
    `select * from users join blood_requests on blood_requests.receiver_cnic = users.cnic where blood_requests.donor_cnic = '${temp_cnic}' and Pending_Accepted = 1;`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.post("/PendingRequests", async (req, res) => {
  const { temp_cnic } = req.body;
  connection.query(
    `select * from users join blood_requests on blood_requests.donor_cnic = users.cnic where blood_requests.receiver_cnic = '${temp_cnic}' and Pending_Accepted = 0;`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.post("/UnsendRequest", async (req, res) => {
  const { r_cnic, d_cnic } = req.body;
  connection.query(
    `UPDATE Blood_Requests SET Pending_Accepted = 3 WHERE Receiver_CNIC = '${r_cnic}' and Donor_CNIC = '${d_cnic}' AND Pending_Accepted = 0;`,
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
  const { temp_cnic } = req.body;
  connection.query(
    `select * from users join blood_requests on blood_requests.donor_cnic = users.cnic where blood_requests.receiver_cnic = '${temp_cnic}' and Pending_Accepted = 1;`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

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
    const count = await query(
      `SELECT count(*) FROM blood_requests WHERE Donor_CNIC = '${d_cnic}' AND Receiver_CNIC = '${r_cnic}' AND Pending_Accepted = 0;`
    );
    const chk_pending = count[0]["count(*)"];
    if (chk_pending >= 1) {
      res.json({
        error: "You Already Have a Pending Request Against This User",
      });
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
    await query(user_query);
    let med_query = `UPDATE medical_records SET Age = '${age}', Weight = '${weight}', Height = '${height}' WHERE CNIC = '${u_cnic}';`;
    await query(med_query);
    res.json({ msg: "Updated Personal Info" });
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
