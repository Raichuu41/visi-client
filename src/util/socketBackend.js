import io from 'socket.io-client';
import { logYellow } from './logging';

let socketUrl;
if (process.env.NODE_ENV === 'production') {
    socketUrl = '129.206.106.202';
} else {
    socketUrl = 'localhost';
}
const socketIp = `${socketUrl}:3000`;
const socketPath = '';
const socket = io.connect(socketIp, {
    transports: ['websocket'],
    reconnectionDelay: 100,
    reconnectionDelayMax: 1000,
    path: socketPath,
});
logYellow('Socket: connect');
export default socket;
