/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        try {
            db.save(newUser); //no duplicate checking
            res.json({success: true, msg: 'Successfully created new user.'});
        }
        catch (err) {
            console.log(`User save fail: ${err.name}`);
        }
    }
});

router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.UNIQUE_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/testcollection')
    .delete(authController.isAuthenticated, (req, res) => {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    }
    )
    .put(authJwtController.isAuthenticated, (req, res) => {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    }
    );
    
router.route("/movies")
    // GET request handler to /movies route and returns an updated payload. No authentication required. 
    .get((req, res) => {
        try {
            // JSON object includes headers, body, key. (duplicated, key = env).
            var object = getJSONObjectForMovieRequirement(req);
            
            // Appending status, message, query, and UNIQUE_KEY to JSON object. 
            object.status = 200;
            object.message = "GET movies";
            object.query = req.query.q ? req.query.q : "No query in request.";
            object.env = process.env.UNIQUE_KEY;
            
            // Adding the object to the response.
            res.json(object);
        }
        catch (err) {
            // Error handling.
            return res.status(500).json({ message: "Error GET /movies", error : err});
        }

    })

    .post((req, res) => {
        // POST request handler to /movies route and returns an updated payload. No authentication required. 
        try {
            // JSON object includes headers, body, key (duplicated, key = env).
            var object = getJSONObjectForMovieRequirement(req);

            // Appending status, message, query, and UNIQUE_KEY to JSON object. 
            object.status = 200;
            object.message = "movie saved";
            object.query = req.query.q ? req.query.q : "No query in request.";
            object.env = process.env.UNIQUE_KEY;

            // Adding the object to the response.
            res.json(object);
        }
        catch (err) {
            // Error handling.
            return res.status(500).json({ message: "Error POST /movies", error : err});
        }
    })
    
    .put(authJwtController.isAuthenticated, (req, res) => {
        // PUT request handler to /movies route and returns an updated payload. JWT authentication (token) required.
        try {
            // JSON object includes headers, body, key (duplicated, key = env).
            var object = getJSONObjectForMovieRequirement(req);

            // Appending status, message, query, and UNIQUE_KEY to JSON object. 
            object.status = 200;
            object.message = "movie updated";
            object.query = req.query.q ? req.query.q : "No query in request.";
            object.env = process.env.UNIQUE_KEY;

            // Adding the object to the response.
            res.json(object);
        }
        catch (err) {
            // Error handling.
            return res.status(500).json({ message: "Error PUT /movies", error : err});
        }
    })

    .delete(authController.isAuthenticated, (req, res) => {
        // DELETE request handler to /movies route and returns an updated payload. Basic authentication 
            // (username, password) required. 
        
        try {
            // JSON object includes headers, body, key (duplicated, key = env)
            var object = getJSONObjectForMovieRequirement(req);

            // Appending status, message, query, and UNIQUE_KEY to JSON object.
            object.status = 200;
            object.message = "movie deleted";
            object.query = req.query.q ? req.query.q : "No query in request.";
            object.env = process.env.UNIQUE_KEY;

            // Adding the object to the response. 
            res.json(object);
        }
        catch (err) {
            // Error handling.
            return res.status(500).json({ message: "Error PUT /movies", error : err});
        }
    })

    .all((req, res) => {
        // All other HTTP verbs not supported on /movies route (PATCH). 
            // OPTIONS and HEAD requests are handled by express and cors middleware.
        res.status(200).send({message : "HTTP method not supported."});
        res.json();
    })

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


