const express = require('express');
const TextDiff = require('text-diff');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library
const app = express();
const port = 4567;

const textDiff = new TextDiff();

// Serve static files from a directory named "public"
app.use(express.static('public'));

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

let newResult = '';
let previousResults = ''; // Variable to store previous results
let resultsArray = []; // Array to store results and their UUIDs

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/', (req, res) => {
  const string1 = req.body.string1;
  const string2 = req.body.string2;

  const differences = textDiff.main(string1, string2);

  const htmlOutput = textDiff.prettyHtml(differences);

  // Wrap the HTML output in a <pre> element to preserve formatting
  const preFormattedOutput = `<pre>${htmlOutput}</pre>`;

  const currentDatetime = new Date().toLocaleString('en-US', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

  const randomUUID = uuidv4();

  // Append the current result to the previous results
  newResult = `
    <div class="result" id="${randomUUID}">
      <div class="header">
        <div class="">
          <span class="datetime">Execution: ${currentDatetime}</span>  
        </div>
        <div class="">
          <div class="close icon close-icon" target-id="${randomUUID}"></div>  
        </div>
      </div>
      <div class="body">
        ${preFormattedOutput}
      </div>
    </div>`;

  previousResults = newResult + previousResults;

  // Store the result in the array
  resultsArray.push({ id: randomUUID, result: newResult });

  res.send(`
    <html>
    <head>
      <title>Diff Checker</title>
      <link rel="stylesheet" type="text/css" href="/styles.css">
      <script>
        
        function clearHistory() {
          fetch('/clear-history', { method: 'POST' })
            .then(() => {
              // After clearing history, you can remove the old results from the page
              document.getElementById('old_results').innerHTML = '';
            })
            .catch((error) => {
              console.error('Error clearing history:', error);
            });
        }

        // Add a function to remove a result by its ID
        function removeResultById(resultId) {
          const resultElement = document.getElementById(resultId);
          if (resultElement) {
            resultElement.remove();
          }
        }

        // Function to handle closing a result
        function closeResult(event) {
          const targetId = event.getAttribute('target-id');
          if (targetId) {
            // Send a request to the server to remove the result
            fetch('/remove-result/' + targetId, { method: 'POST' })
              .then(() => {
                // Remove the result from the screen
                removeResultById(targetId);
              })
              .catch((error) => {
                console.error('Error removing result:', error);
              });
          }
        }

        document.addEventListener('DOMContentLoaded', function () {
          // Add event listeners to close icons
          const closeIcons = document.getElementsByClassName('close icon');
          for (const icon of closeIcons) {
            icon.addEventListener('click', function () {
              closeResult(this);
            });
          }
        });

      </script>
    </head>
    <body>
      <div class="container">
        <h1>Diff Checker</h1>
        <form action="/" method="post">
          <div class="text-container">
            <div class="textarea-left">
              <h3 for="string1">Text 1:</h3>
              <!-- Set the number of rows to 30 -->
              <textarea id="string1" name="string1" rows="20" required>${string1}</textarea>
            </div>
            <div class="textarea-right">
              <h3 for="string2">Text 2:</h3>
              <!-- Set the number of rows to 30 -->
              <textarea id="string2" name="string2" rows="20" required>${string2}</textarea>
            </div>
          </div>
          <br>
          <button type="submit" class="btn" value="Compare">Compare</button>
        </form>

        <hr>
        <h2>Result</h2>
        <div class="result" id="result">${preFormattedOutput}</div>
      </div>

      <div class="container history-container">
        <div class="header">
          <div><h2>History</h2></div>
          <div><button id="clear-history-btn" class="btn" onclick="clearHistory()">Clear History</button></div>
        </div>
        
        <!-- Display previous results in the "old_results" section -->
        <div class="old_results" id="old_results">${previousResults}</div>
      </div>
    </body>
    </html>
  `);
});

// Add this route after your existing routes to remove a result by ID
app.post('/remove-result/:id', (req, res) => {
  const resultId = req.params.id;
  // Remove the result from both the array and the previousResults variable
  resultsArray = resultsArray.filter((result) => result.id !== resultId);
  previousResults = resultsArray.map((result) => result.result).join('');
  res.sendStatus(200);
});

// Add this route after your existing routes to clear history
app.post('/clear-history', (req, res) => {
  // Clear the array and the previousResults variable
  resultsArray.length = 0;
  previousResults = '';
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
