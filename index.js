// index.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

let books = readBooksFromFile();

// Function to read books from a JSON file
function readBooksFromFile() {
    try {
        const data = fs.readFileSync('books.json', 'utf8');
        const books = JSON.parse(data);
        return books.map(book => ({
            ...book,
            status: book.status
        }));
    } catch (err) {
        console.error('Error reading books from file:', err);
        return [];
    }
}

// Function to write books to a JSON file
function writeBooksToFile(books) {
    try {
        fs.writeFileSync('books.json', JSON.stringify(books, null, 2));
    } catch (err) {
        console.error('Error writing books to file:', err);
    }
}

// API routes
app.get('/books', (req, res) => {
    books = readBooksFromFile();  // Ensure we read the latest data
    res.json(books);
});

// GET a book by ID
app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).send('Book not found');
    res.json(book);
});

// POST a new book
app.post('/books', (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).send('Both title and author fields are required.');
    }

    // Check for duplicates
    const duplicate = books.find(b => b.title === title && b.author === author);
    if (duplicate) {
        return res.status(400).send('This book already exists.');
    }

    const newBook = {
        id: books.length + 1,
        title,
        author,
        status: 'Wishlist'
    };
    books.push(newBook);
    writeBooksToFile(books);
    res.status(201).json(newBook);
});

// PUT to update a book by ID
app.put('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const { title, author, status } = req.body;

    const books = readBooksFromFile();
    const book = books.find(b => b.id === bookId);
    if (!book) return res.status(404).send('Book not found');

    if (title) book.title = title;
    if (author) book.author = author;
    if (status) book.status = status;
    
    writeBooksToFile(books);
    res.json(book);
});

app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) return res.status(404).send('Book not found');

    const deletedBook = books.splice(bookIndex, 1);
    writeBooksToFile(books);
    res.json(deletedBook);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
