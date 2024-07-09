const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.static(__dirname));

// VULNERABLE FUNCTION - SEND FILE WITH USER-SUPPLIED FILENAME
function sendFileWithUserSuppliedName(res, filePath) {
  const filename = req.query.filename; // User-supplied filename without validation
  
  const normalizedPath = path.normalize(filename);
	if (!normalizedPath.startsWith('/public')) {
		throw new Error('Illegal path supplied in the input url: ' + filename);
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

app.get('/vulnerable', (req, res) => {
  const filePath = 'files';
  sendFileWithUserSuppliedName(res, filePath);
});

app.listen(3000, () => {
  console.log('Vulnerable app listening at http://localhost:3000');
});
