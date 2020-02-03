let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let noteSchema = new Schema({
  title: String,
  body: String
});

let Note = mongoose.model('Note', noteSchema);

module.exports = Note;