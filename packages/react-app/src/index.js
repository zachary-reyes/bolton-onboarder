import "./index.css";
import "@fontsource/mulish/400.css"
import "@fontsource/mulish/700.css"

import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react"

import App from "./App";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
});

const theme = extendTheme({
  fonts: {
    heading: "Mulish",
    body: "Mulish",
  },
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <ChakraProvider theme={theme}>
    <App />
    </ChakraProvider>
  </ApolloProvider>,
  document.getElementById("root"),
);
