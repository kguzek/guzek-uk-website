import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/styles.css";
import Translations from "./Translations";
import NavigationBar from "./components/Navigation/NavigationBar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import Konrad from "./pages/Konrad";
import NotFound from "./pages/NotFound";

function App() {
  const [language, setLanguage] = useState("EN");
  const data = Translations[language];
  useEffect(() => {}, [language]);

  function changeLang(e) {
    e.preventDefault();
    // get the button text and remove whitespaces as well as Non-Breaking Spaces (&nbsp;)
    const lang = (e.target.textContent || e.target.innerText).replace(
      /[\s\u00A0]/,
      ""
    );
    setLanguage(lang);
  }

  return (
    <Router>
      <div className="App">
        <NavigationBar
          data={data}
          selectedLanguage={language}
          changeLang={changeLang}
        />
        <Routes>
          <Route path="/" element={<Home data={data} />} />
          <Route path="/konrad" element={<Konrad data={data} />} />
          <Route path="*" element={<NotFound data={data} />} />
        </Routes>
        <Footer data={data} />
      </div>
    </Router>
  );
}

export default App;
