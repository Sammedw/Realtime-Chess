//Make Connection
//192.168.0.67
const socket = io.connect("http://192.168.0.75:4000");

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