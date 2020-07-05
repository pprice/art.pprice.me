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

import { NextComponentType } from "next";
import { GalleryIndex } from "@/components/GalleryIndex";

// Generated
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import classes from "*.module.css";

type MyAppProps = AppProps;

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

  const drawerWidth = 250;

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        display: "flex",
      },
      appBar: {
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        borderBottom: "1px solid",
        borderBottomColor: theme.palette.divider,
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
      heading: {
        margin: 0,
        marginTop: -6,
        padding: 0,
        overflow: "visible",
        color: "#444433",
      },
      headingShift: {
        marginLeft: 0,
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      },
      headingOpenShift: {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: -drawerWidth,
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
        <title>art.pprice.me</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <CssBaseline />
          <AppBar
            elevation={0}
            color="secondary"
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: open,
            })}
          >
            <Toolbar>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                className={clsx(classes.headingShift, {
                  [classes.headingOpenShift]: open,
                })}
              >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  className={clsx(classes.menuButton)}
                >
                  <MenuIcon htmlColor="#444433" fontSize="small" />
                </IconButton>

                <Link href="/" color="textPrimary">
                  <Typography variant="h1" noWrap className={clsx(classes.heading)}>
                    art.pprice
                  </Typography>
                </Link>
              </Box>

              <Box flexGrow={1}></Box>

              <Button startIcon={<GitHubIcon htmlColor="#444433" />} href="https://github.com/pprice/art.pprice.me/">
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
              <Typography variant="h6">art.pprice</Typography>
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
