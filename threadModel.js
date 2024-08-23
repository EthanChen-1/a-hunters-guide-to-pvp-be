const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now() },
});

const threadModel = mongoose.model("Thread", threadSchema);
module.exports = threadModel;
