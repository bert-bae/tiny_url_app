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

app.post('/urls', (request, response) => {
  // console.log(request.body);  // debug statement to see POST parameters
  // response.send("Ok");         // Respond with 'Ok' (we will replace this)
  // let templateVariables = { longURL: request.body.longURL};
  // response.send(generateRandomString());
  urlDatabase[generateRandomString()] = request.body.longURL;
  console.log(urlDatabase);
  response.send(urlDatabase);
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