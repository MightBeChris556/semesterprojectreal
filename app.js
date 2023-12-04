var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars');

const fs = require('fs');

const axios = require('axios');
const {json} = require("express");

const pgp = require('pg-promise')(/* options */)
const db = pgp('postgres://postgres:3JJlYB05g1M6OACB@host:5432/postgres')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





/* GET home page. */
app.get('/', function(req, res, next) {
  if (req.cookies["sessionId"] !== "undefined" && req.cookies["sessionId"]){
    res.redirect("/roles/directory")
  }else{
    res.redirect('/login');

  }

});
// Define an endpoint for submitting form data
app.post('/submit-job', async (req, res) => {
    try {
        const { jobName, jobDescription, field3 } = req.body;

        // Perform any necessary validation or processing of form data

        // Insert data into PostgreSQL database
        const result = await db.none('INSERT INTO job (field1, field2, field3) VALUES($1, $2, $3)', [field1, field2, field3]);

        // You can send a success response to the client
        res.json({ success: true, message: 'Form data submitted successfully' });
    } catch (error) {
        console.error('Error submitting form data:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

/* get login page */
app.get('/login', function(req, res, next) {

    res.render('login', { title: 'Express',layout:false });

});
/* get login page */
app.get('/roles/directory', function(req, res, next) {

    res.render('directory', { title: 'Express',layout:false });

});

/* get information about a specific role */
app.get('/roles/:category/:roleName', function(req, res, next) {
    let category = req.params["category"]
    let roleName = req.params["roleName"]


    // Specify the path to your JSON file
    const filePath = __dirname + '/career-categories.json';

    // Read the file asynchronously
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);
            // Get the keys from the JSON object
            let categoryInfo = jsonData[category]

            const roleDetails = jsonData[category]["subcategories"][roleName]
            res.render('roleInformation', {
                title: 'Express',
                layout: false,
                "category": categoryInfo,
                "roleDetails": roleDetails
            });


        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Internal Server Error');
        }
    })





});
/* get information about a specific category */
app.get('/roles/:category', function(req, res, next) {
    let category = req.params["category"]
    let firstLetter = category.charAt(0).toUpperCase()

    // Specify the path to your JSON file
    const filePath = __dirname + '/career-categories.json';

    // Read the file asynchronously
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);
            const categoryData = jsonData[category]
            const subCategories = jsonData[category]["subcategories"]
            // Get the keys from the JSON object

            console.log(jsonData[category])
            res.render('categoryDetail', {
                title: 'Express',
                layout: false,
                "category": categoryData,
                "subCategories": subCategories
            });


        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Internal Server Error');
        }
    })



});

app.post('/login', async function (req, res, next) {
  let email = req.body["email"]
  let password = req.body["password"]
  console.log(email)
  console.log("attempting login")
  axios.post(process.env.dev_api_url + '/authenticateUser', {
    email:email,
    password:password,
    userType:"client"

  })
      .then(async function (response) {
        console.log(response.data)



        let editable = true


        let data = response.data
        res.cookie("sessionId", response.data, {maxAge: ms('1d')});


        res.redirect("/client/dashboard")
      })
      .catch(function (error) {
        console.log(error);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode + errorMessage)
      });
    })





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
