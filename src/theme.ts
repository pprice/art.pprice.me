import { createMuiTheme } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import blue from "@material-ui/core/colors/blue";
import green from "@material-ui/core/colors/green";

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: blue,
    secondary: red,
  },
});

export default theme;
