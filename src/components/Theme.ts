import { createMuiTheme } from "@material-ui/core/styles";

import * as colors from "@material-ui/core/colors";

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    type: "light",
    primary: colors.pink,
    secondary: colors.grey,
  },
  typography: {
    h1: {
      fontFamily: "Lora",
      fontWeight: 400,
      fontSize: "20pt",
      color: "#444433",
    },
    h2: {
      fontFamily: "Lora",
      fontWeight: 400,
      fontSize: "30px",
      color: "#444433",
    },
    h6: {
      fontFamily: "Lora",
      fontWeight: 400,
      fontSize: "14pt",
      color: "#444433",
    },
    fontFamily: "Lato",
  },
});

export default theme;
