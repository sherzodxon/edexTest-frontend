import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000", {
  transports: ["websocket"],
  autoConnect: false, // login bo‘lgach ulanadi
});

export default socket;
