import { utils } from "ethers";

import React, { useEffect, useState } from "react";

import logo from "./meta_chillcopy.png";
import useWeb3Modal from "./hooks/useWeb3Modal";
import {
  ChakraProvider,
  Box,
  Flex,
  Stack,
  Avatar,
  Text,
  Button,
  Link,
  useToast,
} from "@chakra-ui/react";
import { ArrowForwardIcon, CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";

import { fetchSafeBalances, fetchSafeIncomingTxs } from "./utils/requests";

const addresses = {
  molochSummoner: {
    eth: "0x38064F40B20347d58b326E767791A6f79cdEddCe",
    xdai: "0x0F50B2F3165db96614fbB6E4262716acc9F9e098",
    kovan: "0x9c5d087f912e7187D9c75e90999b03FB31Ee17f5",
    rinkeby: "0xC33a4EfecB11D2cAD8E7d8d2a6b5E7FEacCC521d",
  },
  gnosisSafe: "0xEE5504F0a3604d66470aE3c803A762D425000523",
};

function CopyToast({toCopy}) {
  const toast = useToast();
  return (
    <CopyIcon
      onClick={() => {
        navigator.clipboard.writeText(toCopy);
        toast({
          title: "Copied",
          description: "Address Copied to clipboard",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }}
    />
  );
}

function SafeList({ provider }) {
  const [account, setAccount] = useState("");
  const [safeTxInfo, setSafeTxInfo] = useState(null);
  const [safeBalances, setSafeBalances] = useState(null);
  const [boban, setBoban] = useState(null);
  const [goal] = useState(30);
  // const [network, setNetwork] = useState(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const balance = await fetchSafeBalances("mainnet", {
          safeAddress: addresses.gnosisSafe,
        });
        const bal = balance.find((bal) => bal.tokenAddress === null);
        setSafeBalances(utils.formatEther(bal.balance));
        if (!provider) {
          return;
        }
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);
        const safeTx = await fetchSafeIncomingTxs("mainnet", {
          safeAddress: addresses.gnosisSafe,
        });

        // console.log(balance);
        console.log(safeTx);

        // weth or eth
        const ethWethIn = safeTx?.results.filter(
          (tx) =>
            tx.from === account &&
            (tx.tokenAddress === null ||
              tx.tokenAddress === "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
        );

        setSafeTxInfo(ethWethIn);

        let total = 0;
        ethWethIn.forEach((bal) => {
          total += parseFloat(utils.formatEther(bal.value));
        });
        setBoban(
          (total /
            utils.formatEther(
              balance.find((bal) => bal.tokenAddress === null).balance
            )) *
            100
        );
      } catch (err) {
        setSafeTxInfo(null);
        setSafeBalances(null);
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setSafeTxInfo]);

  return (
    <Box rounded="lg">
      <Flex justifyContent="center">
        <Box ml={5} mr={5}>
          <Text color={"#E5E5E5"} fontSize={"1xl"}>
            Goal
          </Text>
          <Text color={"#EF495E"} fontSize={"5xl"}>
            {goal} Ξ
          </Text>
        </Box>
        <Box ml={5} mr={5} w={"50%"} align="center">
          <Text color={"#E5E5E5"} fontSize={"1xl"}>
            In Bank {(+safeBalances).toFixed(4) > goal && " (goal reached)"}
          </Text>
          <Text color={"#EF495E"} fontSize={"5xl"}>
            {safeBalances && <span>{`${(+safeBalances).toFixed(4)} Ξ`}</span>}
          </Text>
        </Box>
        <Box ml={5} mr={5}>
          <Text color={"#E5E5E5"} fontSize={"1xl"}>
            Your Power
          </Text>
          <Text color={"#EF495E"} fontSize={"5xl"}>
            {boban ? boban.toFixed(2) : 0}
          </Text>
        </Box>
      </Flex>
      {!account && (
        <Flex
          border={"solid"}
          rounded={"sm"}
          borderColor={"#272727"}
          borderWidth={"thin"}
          h={20}
          ml={20}
          mr={20}
          justifyContent="center"
          align="center"
        >
          <Box>
            <Text fontSize={"2xl"} color={"#E5E5E5"}>
              Connect Wallet
            </Text>
          </Box>
        </Flex>
      )}
      <Flex
        border={"solid"}
        rounded={"sm"}
        borderColor={"#272727"}
        borderWidth={"thin"}
        ml={20}
        mr={20}
      >
        <Box w="100%">
          <Flex backgroundColor="#0C0C0C">
            {safeTxInfo &&
              safeTxInfo?.map((tx, idx) => (
                <Flex
                  justifyContent="space-between"
                  w="100%"
                  align="center"
                  h={20}
                  key={idx}
                >
                  <Box ml={10}>
                    <Text fontSize={"lg"} color={"#E5E5E5"}>
                      {idx + 1 + ""}
                    </Text>
                  </Box>
                  <Box ml={10} key={idx}>
                    <Text
                      fontSize={"lg"}
                      color={"#E5E5E5"}
                    >{`${utils.formatEther(tx.value)} ${
                      !tx.tokenAddress ? "Ξ" : "wΞ"
                    }`}</Text>
                  </Box>
                  <Box ml={10}>
                    <Text fontSize={"lg"} color={"#E5E5E5"}>
                      {tx.executionDate}
                    </Text>
                  </Box>
                  <Box m={10}>
                    <Text fontSize={"lg"} color={"#EF495E"}>
                      {tx.transactionHash.substring(0, 6) +
                        "..." +
                        tx.transactionHash.substring(60)}
                      <CopyToast toCopy={tx.transactionHash}/>
                    </Text>
                  </Box>
                </Flex>
              ))}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  const [account, setAccount] = useState("");
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        if (!provider) {
          return;
        }
        // console.log('provider', provider.network.chainId);
        // Load the user's accounts.
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);

        // Resolve the ENS name for the first account.
        let name;
        try {
          name = await provider.lookupAddress(accounts[0]);
        } catch {
          console.log("no ens");
        }
        // Render either the ENS name or the shortened account address.
        if (name) {
          setRendered(name);
        } else {
          setRendered(account.substring(0, 6) + "..." + account.substring(36));
        }
      } catch (err) {
        setAccount("");
        setRendered("");
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setAccount, setRendered]);

  return (
    <Button
      size="xs"
      m={5}
      backgroundColor={"#EF495E"}
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function calculateTimeLeft() {
  const launch = "2021-10-29";
  const difference = +new Date(launch) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
}

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  useEffect(() => {
    const id = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearTimeout(id);
    };
  });

  useEffect(() => {
    if (!provider) {
      return;
    }
    const setup = async () => {
      console.log("network123", provider.network);
      provider.provider.on("chainChanged", (chainId) => {
        window.location.reload();
      });
    };
    setup();
  }, [provider]);

  const timerComponents = Object.keys(timeLeft).map((interval, idx) => {
    return (
      <Box m={10} key={idx}>
        <Text color={"#EF495E"} fontSize={"5xl"}>
          {timeLeft[interval] || "0"}
        </Text>
        <Text color={"#E5E5E5"}>{interval}</Text>
      </Box>
    );
  });

  return (
    <ChakraProvider resetCSS>
      <Box backgroundColor={"#151515"} minH="100vh">
        <Stack spacing={2}>
          <Stack spacing={2}>
            <Flex justifyContent="space-between" alignItems="center" p={0}>
              <ArrowForwardIcon p={0} />
              <Flex
                justifyContent="flex-end"
                alignItems="center"
                p={0}
                w="30%"
              />
              <WalletButton
                provider={provider}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
              />
            </Flex>
            <Flex alignItems="flex-start" justifyContent="center">
              <Flex>
                <Avatar size="2xl" backgroundColor="#0C0C0C" src={logo} />
              </Flex>
              {timerComponents.length ? (
                timerComponents
              ) : (
                <span>Time's up!</span>
              )}
            </Flex>
            <Box justifyContent="center" pl={20} pr={20}>
              <Text align="center" color={"#E5E5E5"}>
                Yeet funds to:{" "}
              </Text>
              <Box
                align="center"
                rounded="lg"
                backgroundColor="#0C0C0C"
                border={"solid"}
                borderRadius={5}
                borderColor={"#EF495E"}
                borderWidth={"thin"}
                p={5}
              >
                <Text fontSize={"2xl"} align="center" color={"#EF495E"}>
                  {addresses.gnosisSafe} <CopyToast toCopy={addresses.gnosisSafe} />
                </Text>
              </Box>
            </Box>
            <SafeList provider={provider} />
            <Flex
              pr={20}
              alignItems="center"
              justifyContent="flex-end"
              color={"#EF495E"}
            >
              <Text>
                <Link
                  href="https://hackmd.io/_S8byns4RgazP7YenJJl9w"
                  isExternal
                >
                  More about MFT <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
            </Flex>
          </Stack>
        </Stack>
      </Box>
    </ChakraProvider>
  );
}

export default App;
