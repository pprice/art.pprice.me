import React, { FunctionComponent } from "react";
import { NextComponentType, NextPageContext } from "next";
import { Typography, Box, Link, Button, useMediaQuery } from "@material-ui/core";
import theme from "@/components/Theme";

type ErrorProps = {
  statusCode?: number;
};

type ErrorContext = NextPageContext & { err: any };
type GetInitialProps = NextComponentType<ErrorContext>["getInitialProps"];

const Error: FunctionComponent<ErrorProps> & { getInitialProps?: GetInitialProps } = ({ statusCode }) => {
  return <ErrorComponent statusCode={statusCode} />;
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export const ErrorComponent: FunctionComponent<ErrorProps> = ({ statusCode }) => {
  let message = "Something went wrong";
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });

  switch (statusCode) {
    case 404:
      message = "What you are looking for does not exist";
      break;
  }

  return (
    <Box>
      <Box
        margin={4}
        display="flex"
        flexDirection={isDesktop ? "row" : "column"}
        justifyContent="center"
        alignItems="center"
      >
        <Box marginRight={4} marginBottom={isDesktop ? 0 : 2}>
          <Typography variant="h1" style={{ fontSize: 100 }}>
            {statusCode || "?"}
          </Typography>
        </Box>
        <Typography variant="h1" align="center">
          {message}
        </Typography>
      </Box>
      <Box justifyContent="center" display="flex">
        <Button size="large" variant="outlined" href="/">
          Go Home
        </Button>

        {statusCode !== 404 && (
          <Box marginLeft={2}>
            <Button size="large" variant="outlined" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Error;
