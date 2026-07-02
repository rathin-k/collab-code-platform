import { useState } from "react";
import { signup } from "../services/authService";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
   e.preventDefault();

   try {
    const response = await signup({
      name,
      email,
      password,
    });

    alert(response.data.message);

    console.log(response.data);

  } catch (error) {
    alert(error.response?.data?.message || "Signup Failed");
  }
};

  return (
    <div>
      <h1>Signup</h1>

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">
          Signup
        </button>
      </form>
    </div>
  );
}

export default Signup;