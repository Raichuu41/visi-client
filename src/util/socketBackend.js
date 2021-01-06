import io from 'socket.io-client';
import { logYellow } from '@/util/logging';

const socketIp = 'localhost:3000';
const socketPath = '';
const socket = io.connect(socketIp, {
    transports: ['websocket'],
    reconnectionDelay: 100,
    reconnectionDelayMax: 1000,
    path: socketPath,
});
logYellow('Socket: connect');
export default socket;
