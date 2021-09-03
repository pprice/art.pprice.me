import * as colors from "@material-ui/core/colors";

import createBreakpoints from "@material-ui/core/styles/createBreakpoints";
import { createTheme } from "@material-ui/core/styles";

const breakpoints = createBreakpoints({});

// Create a theme instance.
const theme = createTheme({
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
      [breakpoints.down("sm")]: {
        fontSize: "16px",
      },
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
