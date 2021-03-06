const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['TEST123', 'TEST456']
}));
app.set('view engine', 'ejs');

// Generate random number [A-Za-z0-9]
function generateRandomString() {
  let result = ["tu."];
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result.push(possibleChars[Math.floor(Math.random() * possibleChars.length)]);
  }
  return result.join("");
}

// received some help from Adam
function filterLinksByOwner(userKey) {
  let userLinks = {};
  for (let link in urlDatabase) {
    if (urlDatabase[link].owner === userKey) {
      userLinks[link] = urlDatabase[link].longURL;
    }
  }
  return userLinks;
}

// existing account verification, if existing, then return the user_id key. If not, then return false
function findUserByEmail(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return false;
}


const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    owner: "randomUser1"
  },
  tsm5xK: {
    longURL: "http://www.google.com",
    owner: "randomUser1"
  },
  h2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    owner: "randomUser2"
  },
  csm5xK: {
    longURL: "http://www.google.com",
    owner: "randomUser2"
  }
};

// example of how users database is structured
const users  = {
  // randomUser1: {
  //   id: "randomUser1",
  //   username: "idname1",
  //   email: "useremail1@gmail.com",
  //   password: "password1"
  // },
  // randomUser2: {
  //   id: "randomUser2",
  //   username: "idname2",
  //   email: "useremail2@gmail.com",
  //   password: "password2"
  // }
};


app.get('/', (request, response) => {
  response.redirect('/login');
});


// users[request.session.user_id].userid
app.get('/urls', (request, response) => {
  if (request.session.user_id) {
    let templateVariables = {
      user: users[request.session.user_id],
      urls: filterLinksByOwner(request.session.user_id),
    };
    response.render('urls_index', templateVariables);
  } else {
    response.redirect(401, '/login');
  }
});

// when client inserts long URL, generate shortURL and submit to urlDatabase object as pair
app.post('/urls', (request, response) => {
  if (request.session.user_id) {
    let newKey = generateRandomString();
    urlDatabase[newKey] = {
      longURL: request.body.longURL,
      owner: request.session.user_id
    };
    response.redirect('/urls');
  } else {
    response.redirect(401, '/login');
  }
});

app.get('/urls/new', (request, response) => {
  if (request.session.user_id) {
    let templateVariables = {
      user: users[request.session.user_id],
    };
    response.render('urls_new', templateVariables);
  } else {
    response.redirect('/login');
  }
});

app.get('/urls/:id', (request, response) => {
  if (request.session.user_id) {
    if (!urlDatabase.hasOwnProperty(request.params.id)) {
      response.redirect(404, '/urls');
    } else {
      let templateVariables = {
        shortURL: request.params.id,
        urls: urlDatabase[request.params.id],
        user: users[request.session.user_id],
      };
      response.render('urls_show', templateVariables);
    }
  } else {
    response.redirect(401, '/login');
  }
});

// update new longURL with shortURL as long as new longURL is not blank (only owner can edit)
app.post('/urls/:id', (request, response) => {
  let templateVariables = { urls: urlDatabase[request.params.id] };
  for (let link in urlDatabase) {
    if (urlDatabase[link].owner === request.session.user_id && link === request.params.id && request.body.longURL !== "") {
      urlDatabase[link].longURL = request.body.longURL;
    }
  }
  response.redirect('/urls');
});

// delete urls (only owner can delete)
app.post('/urls/:id/delete', (request, response) => {
  let templateVariables = { urls: urlDatabase };
  if (urlDatabase[request.params.id].owner === request.session.user_id) {
    delete urlDatabase[request.params.id];
  }
  response.redirect('/urls');
});

// https://expressjs.com/en/api.html (search req.params --> retrieving :shortURL)
app.get("/u/:shortURL", (request, response) => {
  if (urlDatabase.hasOwnProperty(request.params.shortURL)) {
    let longURL = urlDatabase[request.params.shortURL].longURL;
    response.redirect(longURL);
  } else {
    response.redirect(404, '/urls');
  }
});

app.get('/login', (request, response) => {
  if (request.session.user_id) {
    response.redirect('/urls');
  } else {
    response.render('urls_login');
  }
});

// login via comparison with hashed pass
app.post('/login', (request, response) => {
  if (findUserByEmail(request.body.email) === false) {
    response.status('403').send('Error 403: E-Mail is not valid');
  } else if (bcrypt.compareSync(request.body.password, findUserByEmail(request.body.email).password)) {
    request.session.user_id = findUserByEmail(request.body.email).id;
    response.redirect('/urls');
  } else if (findUserByEmail(request.body.email).password !== request.body.password) {
    response.status('403').send('Error 403: Password is incorrect.');
  }
});

// redirect and provide option to login again - credit to Adam for fixing logut issue -> request.session = null, help from Andy
app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/login');
});

app.get('/register', (request, response) => {
  response.render('urls_register');
});

// registration section
app.post('/register', (request, response) => {
  let userKey = generateRandomString();
  if (findUserByEmail(request.body.email) !== false) {
    response.status('403').send('Error 403: E-Mail is linked with an account.');
  } else {
    switch (false) {
      case Boolean(request.body.userid):
        response.status('400').send('Error 400: User ID is necessary.');
        break;
      case Boolean(request.body.email):
        response.status('400').send('Error 400: E-Mail is necessary.');
        break;
      case Boolean(request.body.password):
        response.status('400').send('Error 400: Password is necessary.');
        break;
      default:
        users[userKey] = {
          id: userKey,
          username: request.body.userid,
          email: request.body.email,
          password: bcrypt.hashSync(request.body.password, 10), // added hashed password
        };
        request.session.user_id = userKey;
        response.redirect('urls');
        break;
    }
  }
});

app.get('/:id', (request, response) => {
  response.redirect('/login');
});

// port verification on console
app.listen(8080);
console.log("Listening to port: 8080.");