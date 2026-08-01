import Home from "./Home";
import DemoAIA from "./DemoAIA";

/**
 * Roteamento por caminho, sem router: o site tem duas páginas e não justifica
 * a dependência. O `vercel.json` reescreve tudo pro index.html, pra que
 * /aia funcione ao ser aberto direto ou compartilhado.
 */
function App() {
  const caminho = window.location.pathname.replace(/\/+$/, "");
  if (caminho === "/aia") return <DemoAIA />;
  return <Home />;
}

export default App;
