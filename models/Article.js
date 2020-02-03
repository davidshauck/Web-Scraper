let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let ArticleSchema = new Schema({

  title: {
    type: String,
    required: true,
    unique: true
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  body: {
    type: String,
    required: true,
    unique: true
  },
  saved: {
    type: Boolean,
    default: false
  },
  note: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Note'}],
  }
});

let Article = mongoose.model("Article", ArticleSchema);

module.exports = Article; //exporting Article