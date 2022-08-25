const STORAGE_KEY = 'BOOKSHELF_APPS';

const title = document.getElementById("inputBookTitle");
const author = document.getElementById("inputBookAuthor");
const year = document.getElementById("inputBookYear");
const read = document.getElementById("inputBookIsComplete");

const searchTitle = document.getElementById("searchBookTitle");
const btnSearch = document.getElementById("searchSubmit");
const btnClear = document.getElementById("searchClear");

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    let books = getBookData();
    renderBookList(books);
  }
});

read.addEventListener('change', function () {
  const isCompleteCheck = read.checked;

  if (isCompleteCheck) {
    document.getElementById("isCompleted").style.display = "inline-block";
    document.getElementById("isNotCompleted").style.display = "none";
  } else {
    document.getElementById("isNotCompleted").style.display = "inline-block";
    document.getElementById("isCompleted").style.display = "none";
  }
});

function getBookData() {
  if (localStorage.getItem(STORAGE_KEY) === null) {
    return [];
  } else {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  }
}

function addBook() {
  const bookTitle = title.value;
  const bookAuthor = author.value;
  const bookYear = year.value;
  const isComplete = read.checked;

  const generatedID = generateId();
  const booksObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isComplete);
  
  let books = getBookData();

  if (isStorageExist()) {
    books.push(booksObject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    renderBookList(books);
    clearForm();

    alertDialog('Data berhasil disimpan!');
  }
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

function clearForm() {
  title.value = "";
  author.value = "";
  year.value = "";
  read.checked = false;
}

btnSearch.addEventListener('click', function() {
  let books = getBookData();
  const bookSearchList = [];

  for (let i = 0; i < books.length; i++) {
    const bookTitle = books[i].title.toLowerCase();
    const searchBookTitle = searchTitle.value.toLowerCase();
    if (bookTitle.includes(searchBookTitle)) {
      bookSearchList.push(books[i]);
    }
  }

  renderBookList(bookSearchList);
});

btnClear.addEventListener('click', function() {
  searchTitle.value = "";
  renderBookList(getBookData());
});

function renderBookList(books) {
  const uncompletedBookList = document.getElementById('incompleteBookshelfList');
  uncompletedBookList.innerHTML = '';

  const completedBookList = document.getElementById('completeBookshelfList');
  completedBookList.innerHTML = '';

  if (books.length === 0) {
    let bookElement = `<p style="text-align:center;">Data buku tidak ada</p>`
    uncompletedBookList.innerHTML += bookElement
    completedBookList.innerHTML += bookElement
  }

  for (const bookItem of books) {
    if (!bookItem.isComplete) {
      let bookElement = `
        <article class="book_item shadow">
          <h3>${bookItem.title}</h3>
          <p>Penulis: ${bookItem.author}</p>
          <p>Tahun: ${bookItem.year}</p>

          <div class="action">
            <button class="green" onclick="readBookFinished('${bookItem.id}')">Selesai dibaca</button>
            <button class="red" onclick="removeBook('${bookItem.id}')">Hapus buku</button>
            <button class="blue" onclick="editBook('${bookItem.id}')">Edit buku</button>
          </div>
        </article>
      `;
      uncompletedBookList.innerHTML += bookElement;
    } else {
      let bookElement = `
        <article class="book_item shadow">
          <h3>${bookItem.title}</h3>
          <p>Penulis: ${bookItem.author}</p>
          <p>Tahun: ${bookItem.year}</p>

          <div class="action">
            <button class="green" onclick="readBookUnfinished('${bookItem.id}')">Belum selesai dibaca</button>
            <button class="red" onclick="removeBook('${bookItem.id}')">Hapus buku</button>
            <button class="blue" onclick="editBook('${bookItem.id}')">Edit buku</button>
          </div>
        </article>
      `;
      completedBookList.innerHTML += bookElement;
    }
  }
}

function editBook(id) {
  const editDialog = document.querySelector('.dialog');
  editDialog.innerHTML = '';

  document.querySelector('.dialog').style.display = 'block'

  const bookTarget = findBook(id);

  let editForm = `
  <section class="edit_section shadow">
    <h2>Edit Data Buku</h2>
    <form id="editBook">
      <div class="input">
        <label for="editBookTitle">Judul</label>
        <input id="editBookTitle" type="text" required value='${bookTarget.title}'>
      </div>
      <div class="input">
        <label for="editBookAuthor">Penulis</label>
        <input id="editBookAuthor" type="text" required value='${bookTarget.author}'>
      </div>
      <div class="input">
        <label for="editBookYear">Tahun</label>
        <input id="editBookYear" type="number" required value='${bookTarget.year}'>
      </div>
      <div class="edit_action">
        <button id="editSubmit" type="button" onclick="saveEditDialog('${bookTarget.id}')">
          Simpan 
        </button>
        <button id="editCancel" type="button" onclick="closeDialog()">
          Batal 
        </button>
      </div>
    </form>
  </section>
  `
  editDialog.innerHTML += editForm
}

function closeDialog() {
  document.querySelector('.dialog').style.display = 'none'
}

function saveEditDialog(id) {
  let book = findBook(id);
  const editTitle = document.getElementById("editBookTitle").value;
  const editAuthor = document.getElementById("editBookAuthor").value;
  const editYear = document.getElementById("editBookYear").value;
  const booksObject = generateBookObject(id, editTitle, editAuthor, editYear, book.isComplete);
  
  const bookUpdated = findBookIndex(id);

  if (bookUpdated === -1) return;
  
  let books = getBookData();
  books.splice(bookUpdated, 1);

  books.push(booksObject)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  closeDialog()

  renderBookList(books);
}

function readBookFinished(id) {
  const bookTarget = findBook(id);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;

  let books = getBookData().filter((a) => a.id != id);
  books.push(bookTarget);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  renderBookList(books);

  alertDialog('Buku berhasil dipindahkan ke rak Selesai dibaca!');
}

function readBookUnfinished(id) {
  const bookTarget = findBook(id);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;

  let books = getBookData().filter((a) => a.id != id);
  books.push(bookTarget);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  renderBookList(books);

  alertDialog('Buku berhasil dipindahkan ke rak Belum selesai dibaca!');
}

function findBook(id) {
  let books = getBookData();
  for (const bookItem of books) {
    if (bookItem.id == id) {
      return bookItem;
    }
  }
  return null;
}

function removeBook(id) {
  const confirmDialog = document.querySelector('.dialog');
  confirmDialog.innerHTML = '';

  document.querySelector('.dialog').style.display = 'block'

  const bookTarget = findBook(id);

  let confirmSection = `
  <section class="remove_section shadow">
    <p style="text-align:center;">Apakah Anda yakin akan menghapus buku "${bookTarget.title}"?</p>
    <div class="remove_action">
      <button id="removeSubmit" type="button">
        Hapus 
      </button>
      <button id="removeCancel" type="button" onclick="closeDialog()">
        Batal 
      </button>
    </div>
  </section>
  `
  confirmDialog.innerHTML += confirmSection

  document.getElementById("removeSubmit").addEventListener('click', function () {
    const bookTarget = findBookIndex(id);

    if (bookTarget === -1) return;
    
    let books = getBookData();
    books.splice(bookTarget, 1);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    closeDialog()
    renderBookList(books);
  })
}

function findBookIndex(id) {
  let books = getBookData();
  for (const index in books) {
    if (books[index].id == id) {
      return index;
    }
  }
  return -1;
}

function alertDialog(text) {
  const alDialog = document.querySelector('.dialog');
  alDialog.innerHTML = '';

  document.querySelector('.dialog').style.display = 'block'

  let alertSection = `
  <section class="alert_section shadow">
    <p style="text-align:center;">${text}</p>
    <div class="alert_action">
      <button id="alertOk" type="button">
        Oke 
      </button>
    </div>
  </section>
  `
  alDialog.innerHTML += alertSection

  document.getElementById("alertOk").addEventListener('click', function () {
    closeDialog()
  })
}