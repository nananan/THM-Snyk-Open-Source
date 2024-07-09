const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.static(__dirname));

// VULNERABLE FUNCTION - SEND FILE WITH USER-SUPPLIED FILENAME
function sendFileWithUserSuppliedName(res, filePath) {
  const filename = req.query.filename; // User-supplied filename without validation

  let urlPath = url.parse(filename).pathname;
  urlPath = urlPath.replace(/%2e/ig, '.');
  urlPath = urlPath.replace(/%2f|%5c/ig, '/');
  urlPath = urlPath.replace(/\.\.\//ig,'');

  const normalizedPath = path.normalize(urlPath);
	if (!normalizedPath.startsWith(filePath)) {
		throw new Error('Illegal path supplied in the input url: ' + urlPath);
	}
  
  const fullPath = path.join(__dirname, filePath, normalizedPath);
  
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (!err) {
      res.sendFile(fullPath);
    } else {
      console.error(`File not found: ${filePath}`);
      res.status(404).send('File not found.');
    }
  });
}

app.disable('x-powered-by');
app.use(app.csrf());

app.get('/vulnerable', (req, res) => {
  const filePath = 'files';
  sendFileWithUserSuppliedName(res, filePath);
});

app.listen(3000, () => {
  console.log('Vulnerable app listening at http://localhost:3000');
});
