import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useCookies } from "react-cookie";
import { initializePeer, destroyPeer } from "./utils/peerUtils";
import Peer from "simple-peer";
import { FaRegCommentDots } from "react-icons/fa";
import { CiMemoPad } from "react-icons/ci";

const MonacoEditor: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<{ text: string; name: string }[]>(
    []
  );
  const [comment, setComment] = useState<string>("");

  const [memos, setMemos] = useState<
    { text: string; position: { x: number; y: number } }[]
  >([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const peerRef = useRef<Peer.Instance | null>(null);
  const isInitiator = window.location.hash === "#init";
  const [cookies] = useCookies(["token"]);

  useEffect(() => {
    peerRef.current = initializePeer(isInitiator, setCode);

    return () => {
      destroyPeer();
    };
  }, [isInitiator]);

  useEffect(() => {
    fetchComments(); // 페이지가 처음 로드될 때 댓글 불러오기
  }, [language]); //

  const fetchComments = () => {
    axios
      .get("http://localhost:4000/comments", {
        headers: {
          Authorization: `Bearer ${cookies.token}`, // react-cookie 사용하여 쿠키에서 토큰 가져와 헤더에 추가
        },
        withCredentials: true,
        params: {
          language, // 선택된 언어를 쿼리 파라미터로 보냄
        },
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

    if (showComments) {
      fetchComments(); // 언어 변경 시 댓글창이 열려 있다면 댓글 목록을 업데이트
    }
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
            language,
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
            // fetchComments();
          }
        })
        .catch((error) => {
          console.error("Error submitting comment:", error);
        });
    }
  };

  const handleOpenComments = () => {
    setShowComments(true);
    fetchComments();
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartPos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      // 드래그 중일 때 메모 생성
      const deltaX = event.clientX - dragStartPos.x;
      const deltaY = event.clientY - dragStartPos.y;
      const newPosition = {
        x: dragStartPos.x + deltaX,
        y: dragStartPos.y + deltaY,
      };
      setMemos([...memos, { text: "", position: newPosition }]);
      setIsDragging(false); // 드래그 후 메모를 한 번만 추가하도록 설정
    }
  };

  return (
    <div
      className={`relative grid ${
        showComments ? "grid-cols-2" : "grid-cols-1"
      } min-h-screen`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div>
        <div className="flex justify-between items-center bg-selectBox p-1">
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
          <button
            onClick={handleOpenComments}
            className="text-white p-2 rounded ml-2"
          >
            <FaRegCommentDots size="22" />
          </button>
          <button className="text-white p-2 rounded ml-2">
            <CiMemoPad size="22" />
          </button>
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
      {showComments && (
        <div className="bg-darkBox p-4 relative flex flex-col">
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
      {memos.map((memo, index) => (
        <div
          key={index}
          className="absolute bg-yellow-200 p-2 rounded"
          style={{ left: memo.position.x, top: memo.position.y }}
        >
          <textarea
            value={memo.text}
            onChange={(e) => {
              const updatedMemos = [...memos];
              updatedMemos[index].text = e.target.value;
              setMemos(updatedMemos);
            }}
            className="w-40 h-20 resize-none"
          />
        </div>
      ))}
    </div>
  );
};

export default MonacoEditor;
