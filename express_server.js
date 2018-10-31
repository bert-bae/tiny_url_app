const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls', (request, response) => {
  let templateVariables = { urls: urlDatabase };
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
  response.render('urls_new');
});

app.get('/urls/:id', (request, response) => {
  let templateVariables = {
    shortURL: request.params.id,
    link: urlDatabase
  };
  response.render('urls_show', templateVariables);
});

app.post('/urls/:id', (request, response) => {
  let templateVariables = { urls: urlDatabase };
  for (let link in urlDatabase) {
    urlDatabase[link] = request.body.longURL;
  }
  console.log(urlDatabase);
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