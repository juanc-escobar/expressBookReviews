const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
        const userExists = users.some(user => user.username === username);

        if (!userExists) {
          users.push({"username": username, "password": password});
          return res.status(201).json({message: "User successfully registered. Now you can login"});
        } else {
          return res.status(409).json({message: "User already exists!"}); 
        }
      } else {
        return res.status(400).json({message: "Invalid username. Username is already taken."});
      }
    }
    return res.status(400).json({message: "Invalid username or password."});
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn])
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const bookISBNs = Object.keys(books);

  const booksByAuthor = bookISBNs.reduce((result, isbn) => {
    const book = books[isbn];
    if (book.author === author) {
      result[isbn] = book;
    }
    return result;
  }, {});

  if (Object.keys(booksByAuthor).length > 0) {
    res.send(JSON.stringify(booksByAuthor));
  } else {
    res.status(404).json({ message: "No books found for the provided author" });
  }
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  
  const bookISBNs = Object.keys(books);

  const booksByTitle = bookISBNs.reduce((result, isbn) => {
  const book = books[isbn];
  if (book.title === title) {
    result[isbn] = book;
  }
  return result;
  }, {});

  if (Object.keys(booksByTitle).length > 0) {
    res.send(JSON.stringify(booksByTitle));
  } else {
    res.status(404).json({ message: "No books found for the provided title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books.hasOwnProperty(isbn)) {
    const bookReviews = books[isbn].reviews;
    
    if(Object.keys(bookReviews).length > 0) {
        res.send(JSON.stringify(bookReviews));
    } else {
        res.status(404).json({ message: "No reviews found for the provided ISBN" });
    }
    } else {
    res.status(404).json({ message: "Book not found for the provided ISBN" });
  }
});


//Task 10
public_users.get('/books/async', async function (req, res) {
    try {
      const response = await axios.get('http://localhost:5000/');
      const bookData = response.data;
      return res.json(bookData);
    } catch (error) {
      console.error('Error fetching book data:', error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Task 11
public_users.get('/async/isbn/:isbn', async function (req, res) {
    try {
      const isbn = req.params.isbn;
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
      const bookDetails = response.data;
  
      return res.json(bookDetails);
    } catch (error) {
      console.error('Error fetching book details:', error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//Task 12
public_users.get('/async/author/:author', async function (req, res) {
    try {
      const author = req.params.author;
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      const booksByAuthor = response.data;
  
      return res.json(booksByAuthor);
    } catch (error) {
      console.error('Error fetching books by author:', error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Task 13
public_users.get('/async/title/:title', async function (req, res) {
    try {
      const title = req.params.title;
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      const booksByTitle = response.data;
      return res.json(booksByTitle);
    } catch (error) {
      console.error('Error fetching books by title:', error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports.general = public_users;
