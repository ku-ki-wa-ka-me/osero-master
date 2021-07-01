const express = require('express');
const path = require("path");

const router = express.Router();

router.get('/:gameid', (req, res) => {
    console.log("load game")
    res.sendFile(path.join(__dirname, "../views/game.html"));
});

module.exports = router;