require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("../js/api/v1/models/book.model");
const Order = require("../js/api/v1/models/order.model");

async function main() {
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is missing in backend/.env");
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 });

  const books = await Book.find({ deleted: false, status: "active" })
    .select("_id title soldCount")
    .lean();
  const deliveredOrders = await Order.find({ status: "delivered", isExpired: { $ne: true } })
    .select("items")
    .lean();
  const unitsByBook = new Map();
  for (const order of deliveredOrders) {
    for (const item of order.items || []) {
      const id = String(item.id);
      unitsByBook.set(id, (unitsByBook.get(id) || 0) + (Number(item.quantity) || 0));
    }
  }

  const differences = books
    .map((book) => ({
      id: String(book._id),
      title: book.title,
      currentSoldCount: Number(book.soldCount) || 0,
      deliveredUnits: unitsByBook.get(String(book._id)) || 0,
    }))
    .filter((book) => book.currentSoldCount !== book.deliveredUnits)
    .map((book) => ({ ...book, difference: book.currentSoldCount - book.deliveredUnits }));

  const overcounted = differences.filter((book) => book.difference > 0);
  const undercounted = differences.filter((book) => book.difference < 0);
  const totalOvercount = overcounted.reduce((sum, book) => sum + book.difference, 0);
  const sampleOutliers = [...overcounted]
    .sort((a, b) => b.difference - a.difference)
    .slice(0, 20);

  console.log(JSON.stringify({
    database: mongoose.connection.name,
    activeBooks: books.length,
    deliveredOrders: deliveredOrders.length,
    booksWithMismatch: differences.length,
    overcountedBooks: overcounted.length,
    undercountedBooks: undercounted.length,
    totalOvercountedUnits: totalOvercount,
    largestOvercounts: sampleOutliers,
    apply: process.argv.includes("--apply"),
  }, null, 2));

  if (process.argv.includes("--apply") && differences.length) {
    await Book.bulkWrite(differences.map((book) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(book.id), deleted: false, status: "active" },
        update: { $set: { soldCount: book.deliveredUnits } },
      },
    })), { ordered: false });

    const remainingBooks = await Book.find({ deleted: false, status: "active" })
      .select("_id soldCount")
      .lean();
    const remainingMismatches = remainingBooks.filter(
      (book) => (Number(book.soldCount) || 0) !== (unitsByBook.get(String(book._id)) || 0),
    ).length;
    console.log(JSON.stringify({ updatedBooks: differences.length, remainingMismatches }, null, 2));
    if (remainingMismatches) throw new Error("Sales reconciliation did not fully match delivered order quantities.");
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
