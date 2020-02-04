$(document).ready(function() {

// universal variable to hold our returned data
let data = [];
// if there are no articles display a message
if (data.length === 0) {
    $(".articles").append("Click the scrape button to grab some stories");
}

// click for scraping
$(document).on("click", ".scrape-button", function (e) {
    e.preventDefault(e);
    // empty the div
    $(".articles").empty();
    // call the scrape function
    scrapeArticles();
});

// click for clearing articles
$(document).on("click", ".clear-button", function (e) {
    $(".articles").empty().append("Click the scrape button to grab some stories");
});

// click for showing notes
$(document).on("click", ".get-notes", function (e) {
    $(".modal-title").empty();
    $(".modal-footer").empty();
    $(".note").empty();
    $(".results").empty();
    let articleId;
    $(".modal").modal("show");
    articleId = $(this).attr("data-id");
    $(".modal-title").append("Note for article " + articleId);
    let saveBtn = $("<button class='btn btn-success save-note'>Save Note</button>");
    saveBtn.attr("data-id", articleId);
    $(".modal-footer").append(saveBtn);
    showNotes(articleId);
});



//Click to save article
$(document).on("click", ".save-article", saveArticle);

//Click to get saved articles
$(document).on("click", ".saved-button", getSavedArticles);

//Click to delete saved article
$(document).on("click", ".delete-article", deleteSavedArticle);



// function for scraping articles
function scrapeArticles() {
    // scrape route saves articles to database
    $.get("/api/scrape").then(function(data) {
        // call the function that then grabs the saved articles
        loadDatabase();
    });

}; // end scrapeArtices function

function loadDatabase() {
    // Run an AJAX request for any unsaved headlines
    $.get("/api/articles?saved=false").then(function(data) {

        savedArticles = data;

        console.log(data);
        // debugger;
    //   $(".articles").empty();
      // If we have headlines, render them to the page
      if (data && data.length) {
        renderArticles(data);
      } else {
        // Otherwise render a message explaining we have no saved articles
        $(".articles").empty().append("You have no saved stories");
      }
    });
  }

function renderArticles(data) {
    // loop through the data
    for (i = 0; i < data.length; i ++){
        // create the card
        let card = $("<div class='card'>");
        // add the article's id to the data-id attribute
        card.attr("data-id", data[i]._id);
        // create header
        let header = $("<div class='card-header col-lg-12'>");
        // create article title
        let title = $("<div class='col-lg-10'><h5><a href='https://finance.yahoo.com" + data[i].link + "'>"+data[i].title+"</a></h5>");
        // create the save button
        let saveBtn = $("<div class='col-lg-2'><button>");
        // add text to save button
        saveBtn.text("Save article");
        // add classes
        saveBtn.addClass("btn btn-danger save-article");
        // add article id
        saveBtn.attr("data-id", data[i]._id);
        //append title and saveBtn to header
        header.append(title, saveBtn);
        // create body variable
        let body = $("<div class='card-text'>").text(data[i].body);
        // append header & body to card
        card.append(header, body);
        // append card to articles div
        $(".articles").append(card);

    }
};

// get saved articles function
function getSavedArticles() {
    // Run an AJAX request for any unsaved headlines
    $.get("/api/getsaved").then(function(data) {
    // empty the array
    savedArticles = [];
    // set the array to the returned data
    savedArticles = data;
      // If there are articles render them to the page
      if (data && data.length) {
        // call the render function
        renderSavedArticles(data);
      } else {
        // Otherwise render a message explaining we have no saved articles
        $(".articles").empty().append("You have no saved articles");
      }
    });
  }

function renderSavedArticles(data) {
    // empty the container
    $(".articles").empty();
    // loop through th data
    for (let i = 0; i < data.length; i++) {
    // create the card to be inserted
    let card = $("<div class='card'>");
    // add the db article id to the data attribute
    card.attr("data-id", data[i]._id);
    // create the header
    let header = $("<div class='card-header col-lg-12'>");
    // create the title
    let title = $("<div class='col-lg-10'><h5><a href='https://finance.yahoo.com" + data[i].link + "'>"+data[i].title+"</a></h5>");
    // create the delete button with attributes
    let deleteBtn = $("<div class='col-lg-1'><button>");
    deleteBtn.text("Delete");
    deleteBtn.addClass("btn btn-danger delete-article");
    deleteBtn.attr("data-id", data[i]._id);
    // create the notes button with attributes
    let notesBtn = $("<div class='col-lg-1'><button>");
    notesBtn.text("Notes");
    notesBtn.addClass("btn btn-success get-notes");
    notesBtn.attr("data-id", data[i]._id);
    // append it all to the header
    header.append(title, deleteBtn, notesBtn);
    // create body
    let body = $("<div class='card-text'>").text(data[i].body);
    // append header & body to card
    card.append(header, body);
    // append to articles div
    $(".articles").append(card);

    }
}

function saveArticle() {
    // set a variable for the article Id
    let articleId = $(this).attr("data-id");
    // Remove card from page
    $(this).parents(".card").remove();
    // Update an existing record in the db
    $.ajax({
      method: "POST",
      url: "/api/save/"+articleId,
      data: articleId
    }).then(function(data) {
      // If the data was saved successfully
      if (data.saved) {
        console.log("saved")
      }
    });
  }

  function deleteSavedArticle() {
    // set a variable for the article Id
    let articleId = $(this).attr("data-id");
    // Remove card from page
    $(this).parents(".card").remove();
    // Update an existing record in the db
    $.ajax({
      method: "POST",
      url: "/api/delete/"+articleId,
      data: articleId
    }).then(function(data) {
      // If the data was saved successfully
      if (data.saved) {
        console.log("saved")
      }
    });
  }

  function showNotes(articleId) {
      console.log(articleId);
    // This function handles opening the notes modal and displaying our notes
    // We grab the id of the article to get notes for from the card element the delete button sits inside
    // var articleId = $(this).attr("data-id");

    // Grab any notes with this headline/article id
    $.get("/api/notes/" + articleId).then(function(data) {
        console.log(data);
        console.log("DATA LENGTH", data.length);
        // debugger;
        let notesToRender = [];
        let currentNote;
        if (data.length === 0) {
            currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
            notesToRender.push(currentNote);
        } else {
          // If we do have notes, go through each one
          for (var i = 0; i < data.length; i++) {
            // Constructs an li element to contain our noteText and a delete button
            currentNote = $("<li class='list-group-item note'>")
              .text(data[i].body)
              .append($("<button class='btn btn-danger note-delete'>x</button>"));
            // Store the note id on the delete button for easy access when trying to delete
            currentNote.children("button").data("_id", data[i]._id);
            // Adding our currentNote to the notesToRender array
            notesToRender.push(currentNote);
          }
        }
        // Now append the notesToRender to the note-container inside the note modal
        $(".results").append(notesToRender);

        //Click to save note
    $(document).on("click", ".save-note", saveNote);

        
        
    //   // Constructing our initial HTML to add to the notes modal
    // //   let modalText = $("#note").val();
    //   var modalText = $("<div class='container-fluid text-center'>").append(
    //     $("<h4>").text("Notes For Article: " + articleId),
    //     $("<hr>"),
    //     $("<ul class='list-group note-container'>"),
    //     $("<textarea placeholder='New Note' rows='4' cols='60'>"),
    //     $("<button class='btn btn-success save'>Save Note</button>")
    //   );
    // //   Adding the formatted HTML to the note modal
    //   $(".btn.save-note").attr(modalText);
    //   var noteData = {
    //     _id: articleId,
    //     notes: data || []
    //   };
    //   // Adding some information about the article and article notes to the save button for easy access
    //   // When trying to add a new note
    //   $(".btn.save-note").attr("id", noteData);
    //   // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
    //   renderNotesList(noteData);
    });
  }

//   function renderNotesList(data) {
//       console.log(data);
//     // This function handles rendering note list items to our notes modal
//     // Setting up an array of notes to render after finished
//     // Also setting up a currentNote variable to temporarily store each note
//     var notesToRender = [];
//     var currentNote;
//     if (!data.notes.length) {
//       // If we have no notes, just display a message explaining this
//       currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
//       notesToRender.push(currentNote);
//     } else {
//       // If we do have notes, go through each one
//       for (var i = 0; i < data.notes.length; i++) {
//         // Constructs an li element to contain our noteText and a delete button
//         currentNote = $("<li class='list-group-item note'>")
//           .text(data.notes[i].noteText)
//           .append($("<button class='btn btn-danger note-delete'>x</button>"));
//         // Store the note id on the delete button for easy access when trying to delete
//         currentNote.children("button").data("_id", data.notes[i]._id);
//         // Adding our currentNote to the notesToRender array
//         notesToRender.push(currentNote);
//       }
//     }
//     // Now append the notesToRender to the note-container inside the note modal
//     $("#results").append(notesToRender);
//   }

  function saveNote() {
    // This function handles what happens when a user tries to save a new note for an article
    // Setting a variable to hold some formatted data about our note,
    // grabbing the note typed into the input box
    var noteData;
    let articleId = $(this).attr("data-id");
    var newNote = $("textarea").val().trim();
    console.log(articleId);
    console.log(newNote);
    // debugger;
    // If we actually have data typed into the note input field, format it
    // and post it to the "/api/notes" route and send the formatted noteData as well
    if (newNote) {
      noteData = { _id: articleId, body: newNote };
      $.post("/api/savenotes/"+articleId, noteData).then(function() {
        // When complete, clear the divs and close the modal
        $("textarea").empty();
        $(".note").empty();
        // $(".modal-title").empty();
        // $(".results").empty();
        $(".modal").modal("hide");
      });
    }
  }


});