var express = require("express");
var fs = require("fs");
var hash = require("password-hash");
var app = express();
var bodyParser = require("body-parser");

const HOST_HOST = 0;
const HOST_USER = 1;
const HOST_PASS = 2;
const HOST_PORT = 3;
const HOST_DB = 4;
const HOST_DOMAIN = 5;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
	extended: true
}));

var host = fs.readFileSync('host.dat', 'utf8').split(",");
if(host[HOST_PASS] == 0) {
	host[HOST_PASS] = "";
}
if(host[HOST_PORT] == 0) {
	host[HOST_PORT] = null;
}
var mysql = require("mysql");
var con = mysql.createConnection({
	host: host[HOST_HOST],
	user: host[HOST_USER],
	password: host[HOST_PASS],
	port: host[HOST_PORT],
	database: host[HOST_DB]
});
var connect_msg = "Error!"
con.connect(function(err) {
	if(!err) {
		connect_msg = "Connected!";
	} else {
		connect_msg = connect_msg + " " + err.code;
		for(i = 0; i < host[HOST_DB].length; ++i) {
			connect_msg += " " + host[HOST_DB].charCodeAt(i);
		}
	}
});
app.get("/", (req, res) => {
	res.send(connect_msg);
});
app.listen(3000, () => {
	console.log("Server On!");
});

app.get("/register", (req, res) => {
	res.render("register.ejs", {domain: host[HOST_DOMAIN]});
});

app.post("/create-account", (req, res) => {
	if(req.body.name && req.body.email && req.body.phone && req.body.password_1 && req.body.password_2) {
		if(req.body.password_1 == req.body.password_2) {
			var passHash = hash.generate(req.body.password_1, {'algorithm': 'sha1', 'saltLength': 8, 'iterations': 1});
			var name = "'" + req.body.name + "'";
			var email = "'" + req.body.email + "'";
			var phone = "'" + req.body.phone + "'";
			var password = "'" + passHash + "'";
			var sql = "INSERT INTO cus_user (name, email, phone, password) VALUES (" + name + "," + email + "," + phone + "," + password + ")";
			
			con.query(sql, (err, result) => {
				if(!err) {
					res.send({'error': false, 'msg': 'ok'});
					console.log(passHash);
				} else {
					res.send({'error': true, 'msg': err.code});
				}
			});
		} else {
			res.send({'error': true, 'msg': 'password mismatch'});
		}
	} else {
		res.send({'error': true, 'msg': 'lack of parameter'});
	}
});

app.post("/verification", (req, res) => {
	if(req.body.email && req.body.password) {
		var sql = "SELECT password FROM cus_user WHERE email=" + "'" + req.body.email + "'";

		con.query(sql, (err, result) => {
			if(!err) {
				if(hash.verify(req.body.password, result[0].password)) {
					res.send({'error': false, "msg": 'verification success'});
				} else {
					res.send({'error': true, "msg": 'wrong password'});
				}
			} else {
				res.send({'error': true, 'msg': err.code});
			}
		});
	} else {
		res.send({'error': true, 'msg': 'lack of parameter'});
	}
})

/*
app.use(express.static("public"));

app.get("/fallinlovewith/:thing", (req, res) => {
	var thing = req.params.thing;
	res.render("love.ejs", {thing: thing});
})

app.get("/post", (req, res) => {
	var posts = [
		{title: "Post 1", author: "A"},
		{title: "Post 2", author: "B"},
		{title: "Post 3", author: "C"}
	]
	res.render("post.ejs", {posts: posts});
})

// "/" => "Hi there!"
app.get("/hi", function(req, res) {
	res.send("Hi there!");
})

app.get("/bye", function(req, res) {
	res.send("Good bye!");
})

app.get("/dog", function(req, res) {
	res.send("MEOW!");
})

app.get("/output/:title/:name/:id", function(req, res) {
	res.send(req.params.title + " " + req.params.name + " " + req.params.id);
})

app.get("/speak/:animal", function(req, res) {
	if(req.params.animal == "pig") {
		res.send("Oink");
	} else if(req.params.animal == "cow") {
		res.send("Moo");
	} else if(req.params.dog == "dog") {
		res.send("Woof woof!");
	}
})

app.get("/repeat/:words/:n", function(req, res) {
	str = "";
	for(i = 0; i < req.params.n; ++i) {
		str = str + req.params.words + " ";
	}
	res.send(str);
})

app.get("*", function(req, res) {
	res.send("ERROR BRO!");
})
*/