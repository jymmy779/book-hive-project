require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("../js/api/v1/models/book.model");

const query = {
  deleted: false,
  status: "active",
  flashSale: true,
  discountPercent: { $gt: 0 },
  flashSaleEndAt: { $gt: new Date() },
  $or: [{ inStock: { $exists: false } }, { inStock: null }],
};

(async () => {
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is missing.");
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 });

  const missingStockBooks = await Book.find(query).select("title inStock").lean();
  console.log(JSON.stringify({
    missingStockBooks: missingStockBooks.map((book) => book.title),
    count: missingStockBooks.length,
    apply: process.argv.includes("--apply"),
  }, null, 2));

  if (process.argv.includes("--apply")) {
    const result = await Book.updateMany(query, { $set: { inStock: 80 } });
    console.log(`Added demo stock to ${result.modifiedCount} active flash-sale books.`);
  }
})()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
