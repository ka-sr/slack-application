import { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";


const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isRegister) {
       await axios.post("https://slack-application.onrender.com/register", form);
        alert("Registered successfully, now login");
        setIsRegister(false);
        return;
      }

    
      const res = await axios.post("https://slack-application.onrender.com/login", form);

      if (res.data?.token) {
        
        localStorage.clear();


        login(res.data.user, res.data.token);

  
        window.location.replace("/");
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-6 rounded w-80 shadow-lg">
        <h2 className="text-xl mb-4 text-center">
          {isRegister ? "Register" : "Login"}
        </h2>

        {isRegister && (
          <input
            name="name"
            placeholder="Name"
            className="w-full mb-2 p-2 bg-slate-700 rounded outline-none"
            onChange={handleChange}
          />
        )}

        <input
          name="email"
          placeholder="Email"
          className="w-full mb-2 p-2 bg-slate-700 rounded outline-none"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 bg-slate-700 rounded outline-none"
          onChange={handleChange}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-2 rounded"
        >
          {isRegister ? "Register" : "Login"}
        </button>

        <p
          className="mt-3 text-sm text-center cursor-pointer text-blue-400 hover:underline"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Already have account? Login"
            : "No account? Register"}
        </p>
      </div>
    </div>
  );
};

export default Login;
