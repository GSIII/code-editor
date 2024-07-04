import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [cookies, setCookies] = useCookies(["token"]);
  const navigate = useNavigate();

  const onEmailChange = (event: ChangeEvent<HTMLInputElement>) =>
    setEmail(event.target.value);
  const onPasswordChange = (event: ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = { email, password };

    axios
      .post("http://localhost:4000/login", user)
      .then((response) => {
        if (response.data.loginSuccess) {
          setCookies("token", response.data.token, { path: "/" });
          localStorage.setItem("name", response.data.name); // 사용자 이름을 로컬 스토리지에 저장
          alert("로그인에 성공했습니다.");
          navigate("/");
        } else {
          setError(response.data.message);
        }
      })
      .catch((error) => {
        console.error("There was an error logging in!", error);
        setError("로그인 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="flex justify-center items-center bg-darkBack h-screen">
      <form
        onSubmit={onSubmit}
        className="flex flex-col justify-center items-center bg-darkBox rounded-3xl border border-slate-500"
        style={{ width: "500px", height: "580px" }}
      >
        <div className="mb-10 text-white text-left w-4/5">
          <p className="text-4xl">Login</p>
          <p className="text-xl">to get started</p>
        </div>

        <input
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="Email"
          className="mb-4 p-2 border border-gray-400 bg-darkBox rounded w-4/5"
        />

        <input
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="Password"
          className="mb-4 p-2 border border-gray-400 bg-darkBox rounded w-4/5"
        />
        {error && <p className="mb-3 text-red-400 text-left w-4/5">{error}</p>}

        <button
          type="submit"
          className="mt-8 mb-4 p-2  bg-blue-700 text-white rounded w-4/5"
        >
          Continue
        </button>
        <p className="text-white">
          New User?{" "}
          <Link to="/signup" className="hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
