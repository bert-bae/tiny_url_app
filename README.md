# TinyURL

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (such as bit.ly).

## Final Product

![Register Page]('./screenshots/register.jpg')
![Example of shortening URL]('./screenshots/example.jpg')
![Main user page]('./screenshots/mainpage.jpg')

## Dependencies

  - "bcrypt"
  - "body-parser"
  - "cookie-session"
  - "ejs"
  - "express"

## Getting started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## User benefits

Only the logged in and verified user has access to edit and delete their shortened URLs.

Any links shortened can be shared for others to have easy access to the URL it is linked to.

## Security

Passwords are stored once hashed using bcrypt.