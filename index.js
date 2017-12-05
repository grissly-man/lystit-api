const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// var mongodb = require('mongodb');

// var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
 //define folder that will be used for static assets
app.use(express.static('/public'));

//CORS 

app.use(function(req, res, next){
	console.log(req.url);
	res.header("Access-Control-Allow-Origin", req.headers.origin);
	res.header("Access-Control-Allow-Credentials", true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "POST GET OPTIONS HEAD");
	next();
});


// HEROKU CONNECTION

app.listen(process.env.PORT || 5000, function(err) {
  if (err) {
    return console.log('something bad happened', err);
  }
  console.log(`Magic is happening on ${process.env.PORT}`);
});

//LOCAL CONNECTION

// app.listen(port, function(err) {
//  if (err) {
//    return console.log('something bad happened', err)
//  }
//  console.log(`Magic is happening on ${port}`)
// });


//CONNECT W/ MONGOOSE OR MONGOCLIENT

// MongoClient.connect(URL, function(err, db) {
//   if(!err) {
//     console.log("We are connected");
//   }
// });

mongoose.connect(process.env.MONGODB_URI, {
	useMongoClient: true
	}, function(error){
		if (error) console.error(error);
		else console.log('mongoose connected');
});

//=====================================================


//MongoDB schema for IN PROGRESS todos
var Schema = new mongoose.Schema({
	description: String,
	due_date: String,
	completed: {
		type: Boolean,
		default: false
	},
	name: String
    },{ collection: 'todo' });

var Todo = mongoose.model('todo', Schema);


app.get('/todo-app', function(request, response) {
  response.send('Hello from Express!');
  console.log('route succesfully getting hit');


	Todo.find({}, function(err,todo){
		console.log('were here');
		if(err){
			console.log('ERROR:',err);
		}else{
			console.log('SUCCESS:',todo);
		}
	});
});


//GET allTodos from MongoDB
app.get('/get-allTodos', function(request, response){
console.log('this route is being hit');

    Todo.find({}, function(err, todo){
        console.log('we are here');
        if(err){
            console.log('ERROR:',err);
        } else{
            response.send(todo);
        }
    });

});

//POST newTodos to MongoDB
app.post('/post-newTodos', function(request, response){
	console.log('post route hit');
	console.log(request.body);
	var todo = new Todo(request.body);
	console.log("newTodos here!",todo);

	todo.save(function (err,todo){
		if(err){
			console.log(err);
		}else{
			// response.send(todo);
			response.json(todo);
		}
	});
});

//EDIT POST

app.post('/post-editTodos', function(req, res) {
	return res.status(400).json({
			status: "error",
			message: "please specifiy an object id"
	});
});

 app.post('/post-editTodos/:id', function(req,res){
 		// adding type-checking will prevent crashing the server
		if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({
				status: "error",
				message: "please specifiy an object id"
			});
		}
		
	 	Todo.findById(req.params.id, function(err, todo) {
	 		// also, we must ensure the client is supplying a valid id, and that the mongo server is behaving properly
	 		// (otherwise node will crash)
			if (err || !todo) {
				return res.status(500).json({
					status: "error",
					message: "no todo found with id " + req.params.id
				});
			}
			
			todo.completed = true;
				todo.save(function (err, response){
					if(err){
				console.log(err);
					}else{
				console.log('response logged', todo);
				res.json(todo);
				}

			});
	 	});
 });

//DELETE as .post
app.post('/post-deleteTodos', function(req, res){
	return res.status(400).json({
		status: 'error',
		message: 'please specify a todo id'
	});
});

app.post('/post-deleteTodos/:id', function(req, res){
 	// adding type-checking will prevent crashing the server
	if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({
			status: "error",
			message: "please specifiy an object id"
		});
	}
	console.log(req.params.id);

	Todo.findByIdAndRemove(req.params.id, function(err, todo){
			console.log('delete todos here!');
	 		// also, we must ensure the client is supplying a valid id, and that the mongo server is behaving properly
	 		// (otherwise node will crash)
			if (err || !todo) {
				return res.status(500).json({
					status: "error",
					message: "no todo found with id " + req.params.id
				});
			}
			
			return res.status(200).json({
				status: 'success',
				message: 'todo successfully deleted'
			});

	});
});