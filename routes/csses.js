const express = require('express');
const path = require("path");

const router = express.Router();

router.get('/:files', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/csses/" + req.params.files));
});

module.exports = router;