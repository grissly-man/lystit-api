const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var mongodb = require('mongodb')

// var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
 //define folder that will be used for static assets
app.use(express.static('/public'));


//CORS 

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


// HEROKU CONNECTION

app.listen(process.env.PORT || 5000, function(err) {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`Magic is happening on ${process.env.PORT}`)
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

mongoose.connect(process.env.MONGODB_URI, function(error){
 useMongoClient: true; 
	if (error) console.error(error);
	else console.log('mongoose connected');
});

//=====================================================


//MongoDB schema for IN PROGRESS todos
Schema = new mongoose.Schema({
	description: String,
	due_date: String,
	status: String,
	name: String
    },{ collection: 'todo' });

var Todo = mongoose.model('todo', Schema);


app.get('/todo-app', function(request, response) {
  response.send('Hello from Express!');
  console.log('route succesfully getting hit');


	Todo.find({}, function(err,todo){
		console.log('were here');
		if(err){
			console.log('ERROR:',err)
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
            console.log('ERROR:',err)
        }else{
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
 app.post('/post-editTodos', function(req,res){

	 	Todo.findOne(req.body, function(err, todo){

			todo.status = 'complete';
				todo.save(function (err, response){
					if(err){
				console.log(err);
					}else{
				console.log('response logged', todo);
				res.send(todo);
				}

			});
	 	});
 });

//DELETE as .post
app.post('/post-deleteTodos', function(req, res){
	res.send('delete post request works');
	console.log(req.body);

	Todo.findOne({_id:req.body._id}, function(err, todo){
		console.log('delete todos here!');
			if(err){console.log('error:', err);}
			else{console.log('success:', todo);}

			todo.remove(function(err){
				if(err){console.log(err)}
			});
	});
});