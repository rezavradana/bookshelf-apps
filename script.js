const books = [];
const RENDER_BOOKS = 'render-books';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('form')
    const searchIcon = document.querySelector('.fa-search');

    submitForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addBook();        
    })

    searchIcon.addEventListener('click', () => { 
        searchBook();
    })
    
    if(isStorageExist()){
        loadDataFromStorage();
    }
})

function addBook(){
    const bookTitle = document.getElementById('bookTitle').value;
    const authorBook = document.getElementById('authorBook').value;
    const yearBook = parseInt(document.getElementById('yearBook').value);
    const inputCheckBox = document.getElementById('isCompleted');
    let isCompleted = (inputCheckBox.checked) ? true : false;
    
    const generatedID = generateId();
    const objectBook = generateBook(generatedID, bookTitle, authorBook, yearBook, isCompleted);
    books.push(objectBook);
    
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveData();
}

function generateId(){
    return +new Date();
}

function generateBook(id, bookTitle, authorBook, yearBook, isCompleted){
    return {
        id,
        bookTitle,
        authorBook,
        yearBook,
        isCompleted,
    }
}

document.addEventListener(RENDER_BOOKS, () => {
    const unfinishedBook = document.getElementById('unfinished-book');    
    unfinishedBook.innerHTML = '';
    
    const finishedBook = document.getElementById('finished-book');
    finishedBook.innerHTML = '';
  
    for(const book of books){
        const bookElement = makeBook(book);          
        if(book.isCompleted){
            finishedBook.append(bookElement);
        }else{
            unfinishedBook.append(bookElement);
        }                         
    }   
})

function makeBook(book){
    const bookTitleEl = document.createElement('h2');
    bookTitleEl.innerText = book.bookTitle;

    const authorYearBookEl = document.createElement('p')
    authorYearBookEl.innerText = `${book.authorBook} | ${book.yearBook}`;
    
    const content1 = document.createElement('div');
    content1.classList.add('content1');
    content1.append(bookTitleEl, authorYearBookEl);
    
    const content2 = document.createElement('div');
    content2.classList.add('content2');

    const buttonTrash = document.createElement('i');    
    buttonTrash.classList.add('fa', 'fa-trash');  

    const buttonEdit = document.createElement('i');
    buttonEdit.classList.add('fa', 'fa-edit');

    if(book.isCompleted){
        const buttonRestore = document.createElement('i');
        buttonRestore.classList.add('fa', 'fa-undo');
        buttonRestore.addEventListener('click', () => {
            undoBookFromCompleted(book.id);
        })
                
        content2.append(buttonEdit, buttonRestore, buttonTrash);       
    }else{
        const buttonCheck = document.createElement('i');
        buttonCheck.classList.add('fa', 'fa-check-circle');
        buttonCheck.addEventListener('click', () => {
            addBookToCompleted(book.id);
        })
     
        content2.append(buttonEdit, buttonCheck, buttonTrash);
    }

    buttonTrash.addEventListener('click', () => {
        removeBook(book.id);
    })

    buttonEdit.addEventListener('click', () => {
        const ElementEditBook = editBook(book.id);  
        saveEdit(ElementEditBook, book.id);
    })

    const container = document.createElement('div');
    container.classList.add('container');
    container.append(content1, content2)

    return container;
}


function findBook(id){
   const find = books.find(book => (book.id === id) ? book : null)
   return find;
}

function addBookToCompleted(id){     
    const bookSearch = findBook(id); 
    if(bookSearch == null) return;

    bookSearch.isCompleted = true;      
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveData();
}

function undoBookFromCompleted(id){
    const bookSearch = findBook(id);
    if(bookSearch == null) return;

    bookSearch.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveData();
}

function removeBook(id){
    for(const book in books){
        if(books[book].id == id){
            books.splice(book, 1);
        }
    }
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveData();
}

// Fungsi untuk menampilkan data buku yang dipilih ke form
function editBook(id){
    const bookTitle = document.getElementById('bookTitle');
    const authorBook = document.getElementById('authorBook');
    const yearBook = document.getElementById('yearBook');
    const inputCheckBox = document.getElementById
    ('isCompleted');       
    
    for(const book of books){
        if(book.id == id){
            bookTitle.value = book.bookTitle;
            authorBook.value = book.authorBook;
            yearBook.value = book.yearBook;
            inputCheckBox.checked = book.isCompleted;      
            return [bookTitle, authorBook, yearBook, inputCheckBox];
        }
    }      
}

// Fungsi untuk menyimpan data yang telah diedit di form
function saveEdit(ElementEditBook, id){
    const btnSubmit = document.getElementById('submitForm');
    const divEdit = document.getElementById('divEdit');
    const btnEditEl = document.createElement('button');
    btnEditEl.innerText = 'Edit';
    btnEditEl.classList.add(`${id}`, 'editBtn');
    btnEditEl.type = 'button';
    btnSubmit.style.display = 'none';
    divEdit.innerHTML = '';
    divEdit.append(btnEditEl);

    btnEditEl.addEventListener('click', () => { 
        for(const book of books){
            if(book.id == id){
                book.bookTitle = ElementEditBook[0].value;
                book.authorBook = ElementEditBook[1].value;
                book.yearBook = ElementEditBook[2].value;
                book.isCompleted = ElementEditBook[3].checked
                document.dispatchEvent(new Event(RENDER_BOOKS));
                saveData();               
            }
        }
    })
}

function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData(){
    if(isStorageExist()){
        const booksJSON = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, booksJSON);       
    }
}   

function loadDataFromStorage(){
    const booksStorage = localStorage.getItem(STORAGE_KEY);
    let booksObject = JSON.parse(booksStorage);

    if(booksObject !== null){
        for(const book of booksObject){
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_BOOKS));
}

// Fungsi untuk pencarian buku
function searchBook(){      
    const bookSearch = document.getElementById('searchBook').value.toLowerCase();  
    const localBook = JSON.parse(localStorage.getItem(STORAGE_KEY));
          
    const resultBook = localBook.filter(book => {           
        const title = book.bookTitle.toLowerCase();
        return title.includes(bookSearch);
    })    
    
    if(resultBook.length == 0){
        alert('Buku tidak tersedia!');
    }

    books.splice(0, books.length);        
    books.push(...resultBook);      
    console.log(resultBook);
    document.dispatchEvent(new Event(RENDER_BOOKS));
}




