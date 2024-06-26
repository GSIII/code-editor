import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import { Editor } from "@monaco-editor/react";

const socket = io("http://localhost:4000");

const MonacoEditor: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const peerRef = useRef<Peer.Instance | null>(null);
  const isInitiator = window.location.hash === "#init";

  useEffect(() => {
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
      if (peerRef.current) {
        peerRef.current.signal(data);
      }
    });

    peerRef.current = peer;

    return () => {
      socket.off("signal");
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [isInitiator]);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    if (peerRef.current && peerRef.current.connected) {
      try {
        peerRef.current.send(value || "");
      } catch (error) {
        console.error("Error sending data through peer:", error);
      }
    } else {
      console.error("Peer is not connected or is null");
    }
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  return (
    <>
      <select onChange={handleLanguageChange} value={language}>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="csharp">C#</option>
        <option value="cpp">C++</option>
        <option value="css">CSS</option>
        <option value="html">HTML</option>
        <option value="json">JSON</option>
      </select>
      <Editor
        height="90vh"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
      />
      <pre>{code}</pre>
    </>
  );
};

export default MonacoEditor;
