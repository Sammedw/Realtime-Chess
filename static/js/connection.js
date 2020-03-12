//Make Connection
//192.168.0.67
const socket = io.connect("http://192.168.0.75:4000");

//export socket to other js files:
export { socket };