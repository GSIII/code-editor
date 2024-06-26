import React from "react";
import MonacoEditor from "./MonacoEditor";
import RegisterPage from "./pages/RegisterPage";

const App: React.FC = () => {
  return (
    <>
      <RegisterPage />

      <MonacoEditor />
    </>
  );
};

export default App;
