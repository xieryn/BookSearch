import { useState, useEffect } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [addedBooks, setAddedBooks] = useState([]);
  const [recommendedBooks] = useState([
    { key: "rec1", title: "Clean Code", author_name: ["Robert C. Martin"] },
    { key: "rec2", title: "The Pragmatic Programmer", author_name: ["Andrew Hunt", "David Thomas"] },
    { key: "rec3", title: "Refactoring", author_name: ["Martin Fowler"] },
  ]);
  const [currentPageBooks, setCurrentPageBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  const booksPerPage = 10;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const newBook = {
      key: Date.now(),
      title: newTitle,
      author_name: [newAuthor],
    };

    setAddedBooks([newBook, ...addedBooks]);
    setNewTitle("");
    setNewAuthor("");
  };

  const fetchBooks = async () => {
    if (!query) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${query}&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.docs) {
        setAllBooks(data.docs);
      } else {
        console.error("No docs found in API response.");
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchBooks();
    } else {
      setAllBooks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  useEffect(() => {
    let mergedBooks = [];

    if (!query) {
      mergedBooks = [...recommendedBooks, ...addedBooks];
    } else {
      mergedBooks = [...addedBooks, ...allBooks];
    }

    const startIndex = (page - 1) * booksPerPage;
    const endIndex = page * booksPerPage;

    setCurrentPageBooks(mergedBooks.slice(startIndex, endIndex));
  }, [allBooks, addedBooks, page, recommendedBooks, query]);

  const totalBooksCount = (page === 1)
    ? (query ? allBooks.length : recommendedBooks.length) + addedBooks.length
    : addedBooks.length + allBooks.length;

  const totalPages = Math.ceil(totalBooksCount / booksPerPage);

  return (
    <div className="container">
      <h1>BookScape</h1>
      <p>A peaceful, user-friendly platform to discover and explore a world of books, from classics to new releases.</p>

      <form onSubmit={handleSearch} className="form">
        <input
          type="text"
          placeholder="Search books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
        />
        <button type="submit" className="button">Search</button>
      </form>

      <form onSubmit={handleAddBook} className="form">
        <input
          type="text"
          placeholder="New Book Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="input"
        />
        <input
          type="text"
          placeholder="Author"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          className="input"
        />
        <button type="submit" className="button">Add Book</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="book-list">
          {currentPageBooks.map((book) => (
            <li key={book.key} className="book-item">
              <strong>{book.title}</strong>
              <br />
              <small>{book.author_name?.join(", ")}</small>
            </li>
          ))}
        </ul>
      )}

      {(totalBooksCount > 0) && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="page-button"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="page-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
