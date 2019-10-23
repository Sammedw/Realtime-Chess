
const express = require("express");
const socket = require("socket.io");

//App setup
const app = express();
const server = app.listen(4000, function () {
    console.log("listening on port 4000");
})

//Static Files
app.use(express.static("public"));

//Socket set up
const io = socket(server);

io.on("connection", function (socket) {
    console.log("made socket connection", socket.id)
});

