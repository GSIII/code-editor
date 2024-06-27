const LoginPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center bg-darkBack h-screen">
      <form
        className="flex flex-col justify-center items-center bg-darkBox rounded-3xl border border-slate-500"
        style={{ width: "500px", height: "580px" }}
      >
        <div className="mb-10 text-white text-left w-4/5">
          <p className="text-4xl">Login</p>
          <p className="text-xl">to get started</p>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 p-2 border border-gray-400 bg-darkBox rounded w-4/5"
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 p-2 border border-gray-400 bg-darkBox rounded w-4/5"
        />

        <button
          type="submit"
          className="mt-8 mb-4 p-2  bg-blue-700 text-white rounded w-4/5"
        >
          Continue
        </button>
        <p className="text-white">New User? Register</p>
      </form>
    </div>
  );
};

export default LoginPage;
