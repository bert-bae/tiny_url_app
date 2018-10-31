const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get('/urls', (request, response) => {
  let templateVariables = { urls: urlDatabase, username: request.cookies.username };
  response.render('urls_index', templateVariables);
});

// when client inserts long URL, generate shortURL and submit to urlDatabase object as pair
app.post('/urls', (request, response) => {
  let newKey = generateRandomString();
  urlDatabase[newKey] = request.body.longURL;
  response.redirect('/urls');
  // response.send(`302: Redirecting to http://localhost:8080/urls/${newKey}. </br> Your short link will go to: ${request.body.longURL}`);
});

app.get('/urls/new', (request, response) => {
  let templateVariables = { username: request.cookies.username };
  response.render('urls_new', templateVariables);
});

app.get('/urls/:id', (request, response) => {
  let templateVariables = {
    shortURL: request.params.id,
    link: urlDatabase,
    username: request.cookies.username
  };
  response.render('urls_show', templateVariables);
});

// update new longURL with shortURL as long as new longURL is not blank;
app.post('/urls/:id', (request, response) => {
  let templateVariables = { urls: urlDatabase };
  for (let link in urlDatabase) {
    if (link == request.params.id && request.body.longURL !== "") {
      urlDatabase[link] = request.body.longURL;
    }
  }
  response.redirect('/urls');
});

app.post('/urls/:id/delete', (request, response) => {
  let templateVariables = { urls: urlDatabase };
  for (let link in urlDatabase) {
    if (link == request.params.id) {
      delete urlDatabase[link];
    }
  }
  response.redirect('/urls');
});

// https://expressjs.com/en/api.html (search req.params --> retrieving :shortURL)
app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

// login, redirect via showing if login cookie is present
app.post('/login', (request, response ) => {
  response.cookie('username', request.body.username);
  response.redirect('/urls');
});

// redirect and provide option to login again
app.post('/logout', (request, response) => {
  response.clearCookie('username');
  response.redirect('/urls');
});

// Generate random number [A-Za-z0-9]
function generateRandomString() {
  let result = [];
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result.push(possibleChars[Math.floor(Math.random() * possibleChars.length)]);
  }
  return result.join("");
}

// port verification on console
app.listen(8080);
console.log("Listening to port: 8080.");