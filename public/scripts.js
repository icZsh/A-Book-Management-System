// public/scripts.js

// Function to create the form dynamically
function createForm() {
    const formContainer = document.getElementById('bookFormContainer');

    const form = document.createElement('form');
    form.id = 'addBookForm';
    form.className = 'form-container'; // Apply the CSS class

    const titleLabel = document.createElement('label');
    titleLabel.setAttribute('for', 'title');
    titleLabel.textContent = 'Title:';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'title';
    titleInput.name = 'title';

    const authorLabel = document.createElement('label');
    authorLabel.setAttribute('for', 'author');
    authorLabel.textContent = 'Author:';

    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.id = 'author';
    authorInput.name = 'author';

    const submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Add Book';

    form.appendChild(titleLabel);
    form.appendChild(document.createElement('br'));
    form.appendChild(titleInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(document.createElement('br'));
    form.appendChild(authorLabel);
    form.appendChild(document.createElement('br'));
    form.appendChild(authorInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(document.createElement('br'));
    form.appendChild(submitButton);

    formContainer.appendChild(form);

    form.addEventListener('submit', addBook);
}

// Function to create the table dynamically
function createTable() {
    const tableContainer = document.getElementById('booksTableContainer');

    const table = document.createElement('table');
    table.id = 'booksTable';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const idHeader = document.createElement('th');
    idHeader.textContent = 'ID';

    const titleHeader = document.createElement('th');
    titleHeader.textContent = 'Title';

    const authorHeader = document.createElement('th');
    authorHeader.textContent = 'Author';

    const statusHeader = document.createElement('th');
    statusHeader.textContent = 'Status';

    const deleteHeader = document.createElement('th');
    deleteHeader.textContent = 'Action';

    headerRow.appendChild(idHeader);
    headerRow.appendChild(titleHeader);
    headerRow.appendChild(authorHeader);
    headerRow.appendChild(statusHeader);
    headerRow.appendChild(deleteHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    tableContainer.appendChild(table);
}

// Function to fetch books from the API and display them in the table
async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/books');
        const books = await response.json();

        const tableBody = document.querySelector('#booksTable tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>
                    <select data-id="${book.id}" class="status-select">
                        <option value="Wishlist" ${book.status === 'Wishlist' ? 'selected' : ''}>Wishlist</option>
                        <option value="Reading" ${book.status === 'Reading' ? 'selected' : ''}>Reading</option>
                        <option value="Finished" ${book.status === 'Finished' ? 'selected' : ''}>Finished</option>
                    </select>
                </td>
                <td><button class="delete-button" data-id="${book.id}">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners to the status select elements
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', updateBookStatus);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', deleteBook);
        });
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

// Function to handle form submission and add a new book
async function addBook(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const title = document.querySelector('#title').value;
    const author = document.querySelector('#author').value;
    
    if (!title || !author) {
        alert('Both title and author fields are required.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, author })
        });

        if (response.ok) {
            fetchBooks(); // Refresh the list of books
            document.querySelector('#addBookForm').reset(); // Reset the form
        } else if(response.status == 400){
            alert('This book already exists.');
        } else {
            console.error('Error adding book:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding book:', error);
    }
}

async function updateBookStatus(event) {
    const select = event.target;
    const bookId = select.getAttribute('data-id');
    const newStatus = select.value;

    try {
        const response = await fetch(`http://localhost:3000/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            console.error('Error updating book status:', response.statusText);
        } else {
            fetchBooks(); // Refresh the list of books
        }
    } catch (error) {
        console.error('Error updating book status:', error);
    }
}


// Function to handle book deletion
async function deleteBook(event) {
    const bookId = event.target.dataset.id;

    try {
        const response = await fetch(`http://localhost:3000/books/${bookId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchBooks(); // Refresh the list of books
        } else {
            console.error('Error deleting book:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting book:', error);
    }
}


// Call the functions to create the form and table when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createForm();
    createTable();
    fetchBooks();
});
