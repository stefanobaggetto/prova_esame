var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Assignment = require('./assignment');

const app = express();


mongoose.Promise = global.Promise;
var options = {
    useMongoClient: true,
    user: 'provaesame',
    pass: 'provaesame'
  };
mongoose.connect('mongodb://provaesame:provaesame@ds129906.mlab.com:29906/prova_esame', options);
const db = mongoose.connection;
db.on('error', err => {
  console.error(`Error while connecting to DB: ${err.message}`);
});
db.once('open', () => {
  console.log('DB connected successfully!');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set port
var port = process.env.PORT || 5000;


// get an instance of the express Router
var router = express.Router();

router.get('/', function (req, res) {
    res.json({ message: 'welcome to our api!' });
});


// route /assignment
router.route('/assignments')

    // create an assignment
    // accessed at POST http://localhost:5000/api/assignments
    .post(function (req, res) {
        // create a new instance of the Assignment model
        var assignment = new Assignment();
        assignment.assignmentID = req.body.assignmentID;
        assignment.studentID = req.body.studentID;
        assignment.assignmentType = req.body.assignmentType;
        assignment.assignmentContent = req.body.assignmentContent;
        
        // set the assignment name (comes from the request)
        assignment.studentID = req.body.studentID;

        // save the assignment and check for errors
        assignment.save(function (err) {
            if (err) { res.send(err); }
            res.json(assignment);
        });

    })
    
    // get all the assignments
    // accessed at GET http://localhost:5000/api/assignments
    .get(function (req, res) {
        Assignment.find(function (err, assignments) {
            if (err) { res.send(err); }
            res.json(assignments);
        });
    });

router.route('/assignments/:assignment_id')

    .get(function (req, res) {
        Assignment.find({
            assignmentID: req.params.assignment_id
        }, function (err, assignment) {
            if (err) { res.send(err); }
            res.json(assignment);
        });
    })

    // update the assignment with this id
    .put(function (req, res) {

        // use our assignment model to find the bear we want
        Assignment.find({
            assignmentID: req.params.assignment_id
        }, function (err, assignment) {
            if (err) { res.send(err); }
            // update the assignment info
            assignment[0].assignmentContent = req.body.assignmentContent;
            // save the assignment
            assignment[0].save(function (err) {
                if (err) { res.send(err); }
                res.json(assignment);
            });

        });
    })

    // delete the assignment with this id
    .delete(function (req, res) {
        Assignment.remove({
            assignmentID: req.params.assignment_id
        }, function (err, assignment) {
            if (err) { res.send(err); }
            res.json({ message: 'Successfully deleted' });
        });
    });


app.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*'); //ingnora le politiche del crossorigin. Senza questa riga il browser blocca la richiesta
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Content-Type', 'application/json');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE');
        return res.status(200).json({});
    }
    // make sure we go to the next routes
    next();
});

// register our router on /api
app.use('/api', router);

// handle invalid requests and internal error
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error: { message: err.message } });
});


app.listen(port);
console.log('Magic happens on port ' + port);
