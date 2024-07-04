import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useCookies } from "react-cookie";

const socket = io("http://localhost:4000");

const MonacoEditor: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<{ text: string; name: string }[]>(
    []
  );
  const [comment, setComment] = useState<string>("");
  const [commentBoxPos, setCommentBoxPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const isInitiator = window.location.hash === "#init";
  const [cookies] = useCookies(["token"]);

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

  const fetchComments = () => {
    axios
      .get("http://localhost:4000/comments", {
        headers: {
          Authorization: `Bearer ${cookies.token}`, // react-cookie 사용하여 쿠키에서 토큰 가져와 헤더에 추가
        },
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.success) {
          setComments(response.data.comments);
        }
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  };

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

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const handleCommentSubmit = () => {
    if (comment.trim() !== "") {
      const userName = localStorage.getItem("name"); // 로컬 스토리지에서 이름 가져오기

      // 서버에 댓글 저장
      axios
        .post(
          "http://localhost:4000/comments",
          {
            text: comment,
            name: userName,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${cookies.token}`, // 쿠키에서 토큰 가져와 헤더에 추가
            },
          }
        )
        .then((response) => {
          if (response.data.success) {
            setComments([...comments, response.data.comment]);
            setComment("");
            fetchComments();
          }
        })
        .catch((error) => {
          console.error("Error submitting comment:", error);
        });
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      const { clientX: x, clientY: y } = event;
      setCommentBoxPos({ x, y });
    }
  };

  const handleEmojiClick = () => {
    setShowComments(true);
    setCommentBoxPos(null);
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      className={`relative grid ${
        showComments ? "grid-cols-2" : "grid-cols-1"
      } min-h-screen`}
    >
      <div>
        <div className="bg-selectBox">
          <select
            onChange={handleLanguageChange}
            value={language}
            className="bg-selectBox text-white p-2"
          >
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
        </div>
        <Editor
          height="100vh"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          className="w-full h-full"
        />
      </div>
      {commentBoxPos && (
        <div
          style={{ top: commentBoxPos.y, left: commentBoxPos.x }}
          className="absolute bg-yellow-300 p-1 rounded cursor-pointer"
          onClick={handleEmojiClick}
        >
          💬
        </div>
      )}
      {showComments && (
        <div className="bg-gray-800 p-4 relative flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-white text-lg">Comments</h2>
            <button onClick={handleCloseComments} className="text-white">
              ✖
            </button>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex mb-4">
              <input
                type="text"
                value={comment}
                onChange={handleCommentChange}
                className="flex-grow p-1.5 rounded-l bg-gray-700 text-white focus:outline-none"
                placeholder="댓글을 입력하세요..."
              />
              <button
                onClick={handleCommentSubmit}
                className="bg-blue-600 text-white p-1.5 rounded-r"
              >
                전송
              </button>
            </div>
            <div className="flex-grow overflow-y-auto">
              {comments.map((comment, index) => (
                <div key={index} className="mb-2">
                  <div className="text-white mb-1">{comment.name}</div>
                  <div className="text-white text-left mb-1">
                    {comment.text}
                  </div>
                  {index < comments.length - 1 && (
                    <hr className="border-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonacoEditor;
