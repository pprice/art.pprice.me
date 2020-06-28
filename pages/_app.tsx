// import "../src/wdyr";
import React, { useEffect, FunctionComponent } from "react";
import clsx from "clsx";
import Head from "next/head";
import { AppProps } from "next/app";

import { createStyles, Theme, makeStyles, ThemeProvider } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  IconButton,
  CssBaseline,
  Divider,
  Button,
  Box,
  Link,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import GitHubIcon from "@material-ui/icons/GitHub";

import theme from "@/components/Theme";

// Generated
import classes from "*.module.css";
import { NextComponentType } from "next";
import { GalleryIndex } from "@/components/GalleryIndex";

type MyAppProps = AppProps & {};

const MyApp: FunctionComponent<MyAppProps> & { getInitialProps?: NextComponentType["getInitialProps"] } = ({
  Component,
  pageProps,
}) => {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  /**
   * background: #649F39;
background: -webkit-radial-gradient(top left, #649F39, #24D7E3);
background: -moz-radial-gradient(top left, #649F39, #24D7E3);
background: radial-gradient(to bottom right, #649F39, #24D7E3);
   */

  const drawerWidth = 250;

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        display: "flex",
      },
      appBar: {
        backgroundImage:
          "linear-gradient(45deg, #f0f0f0 8.33%, #e2e8eb 8.33%, #e2e8eb 50%, #f0f0f0 50%, #f0f0f0 58.33%, #e2e8eb 58.33%, #e2e8eb 100%)",
        backgroundSize: "9px 9px",
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      },
      appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
      menuButton: {
        marginRight: theme.spacing(2),
      },
      hide: {
        display: "none",
      },
      drawer: {
        width: drawerWidth,
        flexShrink: 0,
      },
      drawerPaper: {
        width: drawerWidth,
      },
      drawerHeader: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: "flex-end",
      },
      content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
      },
      contentShift: {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    })
  );

  const classes = useStyles(theme);

  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Head>
        <title>My page</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <CssBaseline />
          <AppBar
            color="secondary"
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: open,
            })}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                className={clsx(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              {!open && (
                <Link href="/" color="textPrimary">
                  <Typography variant="h5" noWrap>
                    art.pprice.me
                  </Typography>
                </Link>
              )}

              <Box flexGrow={1}></Box>

              <Button startIcon={<GitHubIcon />} href="https://github.com/pprice/art.pprice.me/">
                Github
              </Button>
            </Toolbar>
          </AppBar>
          <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={open}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div className={classes.drawerHeader}>
              <Typography>art.pprice.me</Typography>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </div>
            <Divider />
            <GalleryIndex />
          </Drawer>
          <main
            className={clsx(classes.content, {
              [classes.contentShift]: open,
            })}
          >
            <div className={classes.drawerHeader} />
            <Component {...pageProps} />
          </main>
        </div>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default MyApp;
