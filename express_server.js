const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls', (request, response) => {
  let templateVariables = { urls: urlDatabase };
  response.render('urls_index', templateVariables);
});

app.get('/urls/:id', (request, response) => {
  let templateVariables = {
    shortURL: request.params.id,
    link: urlDatabase
  };
  response.render('urls_show', templateVariables);
});

// port verification on console
app.listen(8080);
console.log("Listening to port: 8080.");