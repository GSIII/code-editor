import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface User {
  name: string;
  email: string;
  password: string;
}

const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [emailError, setEmailError] = useState("");
  const [livePasswordValidation, setLivePasswordValidation] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) =>
    setName(event.target.value);
  const onEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setEmail(newEmail);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError("유효한 이메일 주소를 입력하세요.");
    } else {
      setEmailError("");
    }
  };

  const onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setLivePasswordValidation(validatePassword(newPassword));
  };

  const onConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = event.target.value;
    setConfirmPassword(newConfirmPassword);
    if (password && newConfirmPassword !== password) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "비밀번호는 최소 6자 이상이어야 합니다.";
    } else if (!/[0-9]/.test(password)) {
      return "비밀번호에는 최소 하나의 숫자가 포함되어야 합니다.";
    }
    return "";
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!emailError && !confirmPasswordError) {
      const user: User = {
        name,
        email,
        password,
      };

      axios
        .post("http://localhost:4000/register", user)
        .then((response) => {
          if (response.data.success) {
            alert("회원가입이 성공적으로 완료되었습니다.");
          } else {
            alert("회원가입에 실패했습니다.");
          }
        })
        .catch((error) => {
          console.error("There was an error registering!", error);
          alert("회원가입 중 오류가 발생했습니다.");
        });
    }
  };

  return (
    <div className="flex justify-center items-center bg-darkBack h-screen">
      <form
        onSubmit={onSubmit}
        className="flex flex-col justify-center items-center bg-darkBox rounded-3xl border border-slate-500"
        style={{ width: "500px", height: "580px" }}
      >
        <div className="mb-10 text-white text-left w-4/5">
          <p className="text-4xl">Signup</p>
          <p className="text-xl">to get started</p>
        </div>
        <input
          type="text"
          value={name}
          required
          onChange={onNameChange}
          placeholder="Username"
          className="mb-4 p-2 border border-gray-400 bg-darkBox rounded w-4/5"
        />
        <input
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="Email"
          className="mb-4 p-2 border border-gray-400 bg-darkBox rounded w-4/5"
        />
        {emailError && (
          <p className="mb-3 text-red-400 text-left w-4/5">{emailError}</p>
        )}
        <input
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="Password"
          className="mb-4 p-2 border border-gray-400 bg-darkBox rounded w-4/5"
        />
        {livePasswordValidation && (
          <p className="mb-3 text-red-400 text-left w-4/5">
            {livePasswordValidation}
          </p>
        )}

        <input
          type="password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          placeholder="Confirm Password"
          className="mb-4 p-2 border border-gray-400 bg-darkBox rounded w-4/5"
        />
        {confirmPasswordError && (
          <p className="mb-3 text-red-400 text-left w-4/5">
            {confirmPasswordError}
          </p>
        )}
        <button
          type="submit"
          className="mt-8 mb-4 p-2  bg-blue-700 text-white rounded w-4/5"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
