// queries.js - Complete MongoDB queries for PLP Bookstore assignment

// Connect to the database
const db = connect('mongodb://localhost:27017/plp_bookstore');

// Utility function for printing results with labels
function printResults(label, results) {
  print(`\n=== ${label} ===`);
  if (Array.isArray(results)) {
    results.forEach((doc, i) => printjson({ [i+1]: doc }));
  } else {
    printjson(results);
  }
}

// Task 2: Basic CRUD Operations

// 1. Find all books in a specific genre (Fiction)
const fictionBooks = db.books.find({ genre: "Fiction" }).toArray();
printResults("1. All Fiction Books", fictionBooks);

// 2. Find books published after a certain year (1950)
const booksAfter1950 = db.books.find({ published_year: { $gt: 1950 } }).toArray();
printResults("2. Books Published After 1950", booksAfter1950);

// 3. Find books by a specific author (J.R.R. Tolkien)
const tolkienBooks = db.books.find({ author: "J.R.R. Tolkien" }).toArray();
printResults("3. Books by J.R.R. Tolkien", tolkienBooks);

// 4. Update the price of a specific book (The Hobbit)
const updateResult = db.books.updateOne(
  { title: "The Hobbit" },
  { $set: { price: 24.99 } }
);
printResults("4. Update The Hobbit Price", {
  matchedCount: updateResult.matchedCount,
  modifiedCount: updateResult.modifiedCount
});

// 5. Delete a book by its title (1984)
const deleteResult = db.books.deleteOne({ title: "1984" });
printResults("5. Delete '1984'", {
  deletedCount: deleteResult.deletedCount
});

// Task 3: Advanced Queries

// 1. Find books in stock and published after 2010
const inStockRecentBooks = db.books.find({
  in_stock: true,
  published_year: { $gt: 2010 }
}).toArray();
printResults("6. In-Stock Books Published After 2010", inStockRecentBooks);

// 2. Projection (return only title, author, and price)
const projectedBooks = db.books.find(
  {},
  { title: 1, author: 1, price: 1, _id: 0 }
).toArray();
printResults("7. Books with Title, Author, and Price Only", projectedBooks);

// 3. Sorting by price (ascending and descending)
const priceAsc = db.books.find().sort({ price: 1 }).toArray();
const priceDesc = db.books.find().sort({ price: -1 }).toArray();
printResults("8a. Books Sorted by Price (Ascending)", priceAsc);
printResults("8b. Books Sorted by Price (Descending)", priceDesc);

// 4. Pagination (5 books per page)
const page1 = db.books.find().limit(5).toArray();
const page2 = db.books.find().skip(5).limit(5).toArray();
printResults("9a. Pagination - Page 1", page1);
printResults("9b. Pagination - Page 2", page2);

// Task 4: Aggregation Pipeline

// 1. Average price by genre
const avgPriceByGenre = db.books.aggregate([
  {
    $group: {
      _id: "$genre",
      averagePrice: { $avg: "$price" },
      count: { $sum: 1 }
    }
  },
  { $sort: { averagePrice: -1 } }
]).toArray();
printResults("10. Average Price by Genre", avgPriceByGenre);

// 2. Author with most books
const prolificAuthor = db.books.aggregate([
  {
    $group: {
      _id: "$author",
      bookCount: { $sum: 1 }
    }
  },
  { $sort: { bookCount: -1 } },
  { $limit: 1 }
]).toArray();
printResults("11. Author with Most Books", prolificAuthor);

// 3. Books grouped by publication decade
const booksByDecade = db.books.aggregate([
  {
    $project: {
      decade: {
        $subtract: [
          "$published_year",
          { $mod: ["$published_year", 10] }
        ]
      }
    }
  },
  {
    $group: {
      _id: "$decade",
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
]).toArray();
printResults("12. Books Grouped by Publication Decade", booksByDecade);

// Task 5: Indexing

// 1. Create index on title field
const titleIndex = db.books.createIndex({ title: 1 });
printResults("13. Created Index on Title Field", {
  indexName: titleIndex
});

// 2. Create compound index on author and published_year
const authorYearIndex = db.books.createIndex({ author: 1, published_year: 1 });
printResults("14. Created Compound Index on Author and Published Year", {
  indexName: authorYearIndex
});

// 3. Demonstrate performance improvement
const explainWithoutIndex = db.books.find({ title: "The Hobbit" }).explain("executionStats");
const explainWithIndex = db.books.find({ title: "The Hobbit" }).hint({ title: 1 }).explain("executionStats");

printResults("15a. Query Execution Without Index", {
  executionTimeMillis: explainWithoutIndex.executionStats.executionTimeMillis,
  totalDocsExamined: explainWithoutIndex.executionStats.totalDocsExamined
});

printResults("15b. Query Execution With Index", {
  executionTimeMillis: explainWithIndex.executionStats.executionTimeMillis,
  totalDocsExamined: explainWithIndex.executionStats.totalDocsExamined
});

print("\n=== All queries executed successfully ===");