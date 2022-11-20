const mysql = require("mysql");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
// var cookieSession = require('cookie-session')
const cors = require("cors");

const udashRouter = require("./routes/Udash");
app.use("/udash", udashRouter);

var redirect = 0;

// app.use(express.static("resources"))
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// app.get("/",(req,res)=>{
//     // const querry  = "select * from blood_types"
//     // connection.query(querry, (err,result)=>{
//     //     res.send(result)
//     // })
//     res.sendFile('../client/src/App/index.html')
// })

app.get("/api/get_cities", (req, res) => {
  const cities_querry = "select * from cities;";
  connection.query(cities_querry, (err, output) => {
    // console.log(output)
    res.send(output);
  });
});

app.get("/api/get_blood", (req, res) => {
  const blood_query = "select * from blood_types;";
  connection.query(blood_query, (err, output) => {
    // console.log(output)
    res.send(output);
  });
});

function setGlobal() {
  redirect = 1;
}

app.post("/api/signup", (req, res) => {
  console.log("hello");
  // console.log(req.body.first_name)
  const first_name = req.body.first_name;
  const middle_name = req.body.middle_name;
  const last_name = req.body.last_name;
  const email = req.body.email;
  const cnic = req.body.cnic;
  const password = req.body.password;
  const phone_num = req.body.phone_num;
  const city = req.body.city;
  const blood_type = req.body.blood_type;

  const age = req.body.age;
  const weight = req.body.weight;
  const height = req.body.height;
  const medical_condition1 = req.body.medical_condition1;
  const medical_condition2 = req.body.medical_condition2;
  const medical_condition3 = req.body.medical_condition3;

  // console.log(first_name)
  // console.log(middle_name)
  // console.log(last_name)
  // console.log(email)
  // console.log(cnic)
  // console.log(password)
  // console.log(phone_num)
  // console.log(city)
  // console.log(blood_type)
  // console.log(age)
  // console.log(weight)
  // console.log(height)

  // console.log(medical_condition1)

  // console.log(medical_condition2)
  // console.log(medical_condition3)

  // const user_query = `INSERT INTO users (CNIC,Email ,Password ,Phone_Number ,First_Name ,Middle_Name ,Last_Name ,Approved ,Receiver_Request_Counter ,Admin,City)
  // values("${cnic}","${email}","${password}","${phone_num}","${first_name}","${middle_name}","${last_name}",0,0,0,"${city}")`

  bcrypt.hash(password, 10, (err, hashed_password) => {
    if (err) throw err;
    connection.query(
      `INSERT INTO users (CNIC,Email ,Password ,Phone_Number ,First_Name ,Middle_Name ,Last_Name ,Approved ,Receiver_Request_Counter ,Admin,City)
        values("${cnic}","${email}","${hashed_password}","${phone_num}","${first_name}","${middle_name}","${last_name}",0,0,0,"${city}");`,
      (err, result) => {
        // if (err) res.send("An error has occured");
        // else res.send("Sign Up Successful")
        if (err) {
          connection.query(`DELETE FROM users where CNIC = "${cnic}"`);
        } else {
          connection.query(
            `INSERT INTO medical_records (Age, Weight, Height, CNIC, Blood_Group) values(${age},${weight},${height},"${cnic}","${blood_type}");`,
            (err, result) => {
              if (err) console.log(err);
              else {
                if (medical_condition1 != "") {
                  connection.query(
                    `INSERT INTO medical_conditions (user_condition, CNIC) values("${medical_condition1}","${cnic}")`,
                    (err, mc_result) => {
                      if (err) console.log("error in mc1");
                      else console.log("mc 1 inserted");
                    }
                  );
                }

                if (medical_condition2 != "") {
                  connection.query(
                    `INSERT INTO medical_conditions (user_condition, CNIC) values("${medical_condition2}","${cnic}")`,
                    (err, mc_result) => {
                      if (err) console.log("error in mc2");
                      else console.log("mc 2 inserted");
                    }
                  );
                }

                if (medical_condition3 != "") {
                  connection.query(
                    `INSERT INTO medical_conditions (user_condition, CNIC) values("${medical_condition3}","${cnic}")`,
                    (err, mc_result) => {
                      if (err) console.log("error in mc3");
                      else console.log("mc 3 inserted");
                    }
                  );
                }
              }
            }
          );
        }
      }
    );
  });

  // "INSERT INTO USER VALUES"
});

app.post("/api/login", (req, res) => {
  console.log("hello login in");

  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  console.log(password);

  connection.query(
    `select count(*) as count,approved,password  from users where email = "${email}"`,
    (err, output) => {
      if (err) console.log(err);
      else {
        if (output[0].count != 0) {
          if (output[0].approved == 1) {
            const correct_password_hash = output[0].password;
            bcrypt.compare(
              password,
              correct_password_hash,
              (err, comparison_result) => {
                if (err) throw err;
                if (comparison_result) {
                  console.log("user logged in");
                  setGlobal();
                  // req.session.user_id = results[0].id
                  // req.session.user_name = results[0].name
                  // res.redirect("/feed")
                } else {
                  // res.sendStatus(401)
                  console.log("incorrect password");
                }
              }
            );
          } else {
            console.log("account not approved");
          }
        } else {
          console.log("no such user exists");
        }
      }
    }
  );
  if (redirect == 1) {
    console.log("in if");
    res.json("Success");
  }
  // console.log("Success");
});

app.listen(3001, () => {
  console.log("Server listening on port 3001.");
});
