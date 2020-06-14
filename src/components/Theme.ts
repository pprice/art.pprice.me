import { createMuiTheme } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";
import teal from "@material-ui/core/colors/cyan";

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: teal,
    secondary: blue,
  },
});

export default theme;
