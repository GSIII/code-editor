import Peer from "simple-peer";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

let peerRef: Peer.Instance | null = null;

export const initializePeer = (
  isInitiator: boolean,
  setCode: (code: string) => void
) => {
  const peer = new Peer({
    initiator: isInitiator,
    trickle: false,
  });

  peer.on("signal", (data) => {
    console.log("Sending signal:", data);
    socket.emit("signal", data);
  });

  peer.on("connect", () => {
    console.log("Peer connected");
  });

  peer.on("data", (data) => {
    console.log("Received data:", data.toString());
    setCode(data.toString());
  });

  peer.on("error", (err) => {
    console.error("Peer error:", err);
  });

  peer.on("close", () => {
    console.log("Peer connection closed");
  });

  socket.on("signal", (data) => {
    console.log("Received signal:", data);
    if (peerRef) {
      peerRef.signal(data);
    }
  });

  peerRef = peer;

  return peer;
};

export const destroyPeer = () => {
  socket.off("signal");
  if (peerRef) {
    peerRef.destroy();
    peerRef = null;
  }
};
