const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  console.log(username);
  console.log(password);
  console.log(authenticatedUser)

  if (!username || !password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const reviewText = req.query.review;

  if (!username || !isbn || !reviewText) {
    return res.status(400).json({ message: "Invalid request. Please provide username, ISBN, and review text." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews[username]) {
    books[isbn].reviews[username] = { reviewText };
    return res.status(200).json({ message: "Review added successfully." });
  } else {
    books[isbn].reviews[username].reviewText = reviewText;
    return res.status(200).json({ message: "Review modified successfully." });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
  
    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    const reviews = books[isbn].reviews;
  
    if (!reviews || Object.keys(reviews).length === 0) {
      return res.status(404).json({ message: "No reviews found for the book" });
    }
  
    if (!reviews[username]) {
      return res.status(404).json({ message: "No review found for the user and book" });
    }
  
    delete reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
