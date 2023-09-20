const express = require('express');
const TextDiff = require('text-diff');
const bodyParser = require('body-parser'); // Import body-parser
const app = express();
const port = 4567;

const textDiff = new TextDiff();

// Serve static files from a directory named "public"
app.use(express.static('public'));

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

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

  res.send(`
    <html>
    <head>
      <title>Diff Checker</title>
      <link rel="stylesheet" type="text/css" href="/styles.css">
    </head>
    <body>
      <div class="container">
        <h1>Diff Checker</h1>
        <form action="/" method="post">
          <div class="text-container">
            <div class="textarea-left">
              <h3 for="string1">Text 1:</h3>
              <br>
              <!-- Set the number of rows to 30 -->
              <textarea id="string1" name="string1" rows="20" required>${string1}</textarea>
            </div>
            <div class="textarea-right">
              <h3 for="string2">Text 2:</h3>
              <br>
              <!-- Set the number of rows to 30 -->
              <textarea id="string2" name="string2" rows="20" required>${string2}</textarea>
            </div>
          </div>
          <br>
          <button type="submit" class="btn" value="Compare">Compare</button>
        </form>

        <hr>
        <h2>Results</h2>
        <div id="result">${preFormattedOutput}</div>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
