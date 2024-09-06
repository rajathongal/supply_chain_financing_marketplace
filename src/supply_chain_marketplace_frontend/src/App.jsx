import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@mui/material/styles";
import Theme from "./Utils/BaseTheme";
import RenderRoutes from "./routes";
import { BrowserRouter as Router } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ThemeProvider theme={Theme}>
          <CssBaseline enableColorScheme/>
          <RenderRoutes />
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
