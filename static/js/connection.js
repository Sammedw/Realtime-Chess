//Make Connection
var HOST = location.origin
const socket = io.connect(HOST);

 //get cookie
 var sessionCookie = document.cookie;
 //get value of cookie
 var sessionID = sessionCookie.split("=")[1];

//Send sessionID on connect
socket.on("connect", function() {
    //send sessionID to server
    socket.emit("sendSession", {sessionID: sessionID});
})

//export socket to other js files:
export { socket , sessionID};