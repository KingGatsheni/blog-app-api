const express     = require('express');
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose');
const Bcrypt      = require('bcrypt');
const session     = require('express-session');
const ejs         = require('ejs');
const path = require('path');

//declaring global session variables
let loggedin;
let user;

//initiating express
const app         = express();

//initialiazing express session
app.use(session({
secret: 'secret',
resave: true,
saveUninitialized: true,
cookie:{secure:true}
}));


//parsing url object through body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));



//ejs middleware
app.set('view engine', 'ejs');

//importing Schema models
const User        = require('./model/user');
const Post        = require('./model/post');
const Comment     = require('./model/comment');

//connecting to mongodb
mongoose.connect("mongodb://localhost:27017/postDB",(err)=>{
	if(!err){
		console.log('Server connected to mongodb');
	}else{
		console.log('connection error to mongodb')
	}
})

app.get('/', (req, res) =>{
	res.render('login')
})
app.get('/reg',(req,res)=>{
	res.render('register')
})

//login route and verifying password hash from bcrypt
app.post('/apiLogin',async(req, res)=>{
	console.log('Logging In');
	try{
		let user = await User.findOne({username: req.body.username}).exec();
		if(!user){
			return res.status(400).send({message: "The username is invalid"});
		}
		if(!Bcrypt.compareSync(req.body._pass,user._pass)){
			return res.status(400).send({message: "The password is invalid"})
		}
		let sid = req.sessionID;
		loggedin = req.session;
		loggedin = true;
		user = req.session;
		user = req.body.username;
		if(loggedin){
			res.redirect('/apiHome');	
			//res.render('index',{name:user, id:sid});
		//res.send({message: `Logged in as:  ${user} || SessionID: ${sid}`});
		}
	}catch(err){
		res.status(500).send(err)
	}
	
})

//register route, hashing password and validating user inputs
app.post('/apiRegister', async(req,res)=>{
	console.log('Adding new user')
	let _pass = req.body._pass;
	_pass	= Bcrypt.hashSync(req.body._pass, 12)
	let userObj ={
		"_id": new mongoose.Types.ObjectId(),
		"username": req.body.username,
		"email":req.body.email,
		"_pass": _pass
		}
	

let newUser = new User(userObj);
await newUser.save((err, user) =>{
	if(err){
		res.status(400).send("An error occured while adding new user")
	}else{
		res.status(200).json(user);
	}
})
})

//post route to insert new post documents into mongodb
app.post('/apiPost', (req,res)=>{
	console.log('Submitting new Post');
	let postObj = {
		"_id": new mongoose.Types.ObjectId(),
		"title": req.body.title,
		"description":req.body.description,
		"author": "5ee02389bbf59d40025c1d52"
	}
	let newPost = new Post(postObj);
    newPost.save((err, post) =>{
	if(err){
		res.status(400).send("An error occured while adding new post")
	}else{
		res.status(200).json(post);
	}
})
})

//comment route to insert a document into comment collection in mongodb
app.post('/apiComment', (req,res)=>{
	console.log('Submitting new Post');
	let commentObj = {
		"_id": new mongoose.Types.ObjectId(),
		"comment":req.body.comment,
		"author": "55ee02389bbf59d40025c1d52",
		"post" :  "5ee02e3cd08c2c4380092532"
	}
	let newComment = new Comment(commentObj);
    newComment.save((err, com) =>{
	if(err){
		res.status(400).send("An error occured while adding a comment")
	}else{
		res.status(200).json(com);
	}
})
})

//home route to retrieve all post data 
app.get('/apiHome',(req,res)=>{
	console.log('getting all posts')
	loggedin = req.session;
	loggedin = true;
	let sid =req.sessionID;
	user = req.body.username;
 Post.find({}).populate({path: 'author', select: "username"}).exec((err,posts)=>{
	if(err){
		res.status(400).send(err);
	}else{
		if(loggedin){
	       res.render("index",{data:posts, sid,user});
	}else{
		res.send({err: "Please login to view this endpoint"});
	}
	res.end();
		//res.render('index',{title:posts.title, des:posts.description})
		
	}
})
})

//update post route
app.put('/apiUpdate/:id',(req,res)=>{
console.log("updating posts")
let postObj = {
		"title": req.body.title,
		"description":req.body.description,
	} 

	Post.findByIdAndUpdate(req.params.id, postObj, {new : true}).populate({path: 'author', select: "username"}).exec((err,post)=>{
	if(err){
		res.status(400).send(err);
	}else{
		res.status(200).json(post)
	}
})
})

//delete post route
app.delete('/apiDelete/:id',(req,res)=>{
	console.log('deleting post')
	Post.findByIdAndDelete(req.params.id).exec((err, post)=>{
		if(err){
			res.status(400).send(err);
		}else{
			res.status(200).json(post);
		}

	})
})

//update comment route
app.put('/apiUpcom/:id',(req,res) =>{
	console.log("updating posts")
   let commentObj = {
		"comment":req.body.comment
	} 

	Comment.findByIdAndUpdate(req.params.id, commentObj, {new : true}).populate({path: 'author', select: "username"}).populate("post").exec((err,com)=>{
	if(err){
		res.status(400).send(err);
	}else{
		res.status(200).json(com)
	}
})
})


//deleting comment route
app.delete('/apiDelcom/:id',(req,res) =>{
	console.log('deleting comment')
	Comment.findByIdAndDelete(req.params.id).exec((err, com)=>{
		if(err){
			res.status(400).send(err);
		}else{
			res.status(200).json(com);
		}

	})
})

//retrieve all comments
app.get('/apiCom',(req,res) =>{
	console.log('getting all comments')
    Comment.find({}).populate({path: 'author', select: "username"}).populate("post").exec((err,posts)=>{
	if(err){
		res.status(400).send(err);
	}else{
		res.status(200).json(posts)
	}
})
})


//declaring port variables
const PORT = process.env.PORT||8000;
app.listen(PORT, ()=>{
    console.log(`Server Live on port ${PORT}`);
})