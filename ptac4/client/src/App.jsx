import { useState } from "react";
import Login from "./components/Login";
import Painel from "./components/Painel";
import { setToken } from "./api";
import "./App.css";

function App() {
  const [logado, setLogado] = useState(false);

  function sair() {
    setToken(null);
    setLogado(false);
  }

  if (!logado) {
    return <Login aoEntrar={() => setLogado(true)} />;
  }

  return <Painel aoSair={sair} />;
}

export default App;
