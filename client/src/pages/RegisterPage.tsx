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

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) =>
    setName(event.target.value);
  const onEmailChange = (event: ChangeEvent<HTMLInputElement>) =>
    setEmail(event.target.value);
  const onPasswordChange = (event: ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);
  const onConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>) =>
    setConfirmPassword(event.target.value);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      return alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
    }

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
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", width: "300px" }}
      >
        <label>Name</label>
        <input type="text" value={name} onChange={onNameChange} />

        <label>Email</label>
        <input type="email" value={email} onChange={onEmailChange} />

        <label>Password</label>
        <input type="password" value={password} onChange={onPasswordChange} />

        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
        />

        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
