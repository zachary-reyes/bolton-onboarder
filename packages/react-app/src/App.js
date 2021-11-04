import { utils, BigNumber } from "ethers";

import React, { useEffect, useState } from "react";

import logo from "./dh.png";
import useWeb3Modal from "./hooks/useWeb3Modal";
import {
  ChakraProvider,
  Box,
  Flex,
  IconButton,
  Stack,
  HStack,
  VStack,
  Avatar,
  Text,
  Button,
  Link,
  useToast,
} from "@chakra-ui/react";
import { ArrowForwardIcon, CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";

import { fetchSafeBalances, fetchSafeIncomingTxs } from "./utils/requests";

const config = {
  network: "mainnet", // set network this will be using mainnet/xdai
  logo: logo, // change the logo here
  projectName: 'YEET',
  mainColor: '#fe1d5b',
  launch: "2021-10-29 16:00 ", // end date of the yeet
  goal: 20, // goal of the yeet
  gnosisSafe: "0xEE5504F0a3604d66470aE3c803A762D425000523",
  // nativeToken: true,  // not used
  token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // token yeeting in WETH
  tokenSymbol: "Ξ", // symbol to dsiplay
  website: "https://hackmd.io/@daohaus/H17m16ZwK", // information site
};

// const addresses = {
//   molochSummoner: {
//     eth: "0x38064F40B20347d58b326E767791A6f79cdEddCe",
//     xdai: "0x0F50B2F3165db96614fbB6E4262716acc9F9e098",
//     kovan: "0x9c5d087f912e7187D9c75e90999b03FB31Ee17f5",
//     rinkeby: "0xC33a4EfecB11D2cAD8E7d8d2a6b5E7FEacCC521d",
//   },
// };

function CopyToast({ toCopy }) {
  const toast = useToast();
  return (
    <IconButton
      aria-label='Copy Gnosis safe address to clipboard.'
      icon={<CopyIcon />}
      fontSize={{ base: "lg", lg: "2xl" }}
      background='transparent'
      color={config.mainColor}
      _hover={{ background: "transparent" }}
      onClick={() => {
        navigator.clipboard.writeText(toCopy);
        toast({
          title: "Copied",
          description: "Address copied to clipboard",
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
  const [toggleList] = useState(false);
  const [safeTxInfo, setSafeTxInfo] = useState(null);
  const [, setSafeTxInfoAll] = useState(null);
  const [safeBalances, setSafeBalances] = useState(null);
  const [boban, setBoban] = useState(null);
  const [goal] = useState(config.goal);
  // const [network, setNetwork] = useState(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const balance = await fetchSafeBalances(config.network, {
          safeAddress: config.gnosisSafe,
        });
        const bal = balance.find((bal) => bal.tokenAddress === null);
        const tokenBal = balance.find(
          (bal) =>
            bal.tokenAddress &&
            bal.tokenAddress.toLowerCase() === config.token.toLowerCase()
        );

        setSafeBalances(
          utils.formatEther(
            BigNumber.from(bal?.balance || 0).add(
              BigNumber.from(tokenBal?.balance || 0)
            )
          )
        );
        if (!provider) {
          return;
        }
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);
        const safeTx = await fetchSafeIncomingTxs(config.network, {
          safeAddress: config.gnosisSafe,
        });

        // console.log("balance", balance);
        // console.log(safeTx);

        // weth or eth
        const ethWethIn = safeTx?.results.filter(
          (tx) =>
            // tx.from === account &&
            tx.tokenAddress === null ||
            tx.tokenAddress.toLowerCase() === config.token.toLowerCase()
        );
        setSafeTxInfoAll(ethWethIn);

        setSafeTxInfo(ethWethIn.filter((tx) => tx.from === account));
        console.log(ethWethIn, toggleList);
        let total = 0;
        ethWethIn
          .filter((tx) => tx.from === account)
          .forEach((bal) => {
            total += parseFloat(utils.formatEther(bal.value));
          });
        // console.log("total", total);
        setBoban(
          (total /
            utils.formatEther(
              BigNumber.from(bal?.balance || 0).add(
                BigNumber.from(tokenBal?.balance || 0)
              )
            )) *
            100
        );
      } catch (err) {
        setSafeTxInfo(null);
        setSafeBalances(null);
        setSafeTxInfoAll(null);
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setSafeTxInfo, setSafeTxInfoAll, toggleList]);

  return (
    <>
      <Flex justifyContent='space-around'>
        <Box ml={5} mr={5}>
          <Text color='#E5E5E5' fontSize={{ base: "xl" }}>
            Min Goal
          </Text>
          <Text color={config.mainColor} fontSize={{ base: "2xl", lg: "5xl" }}>
            {goal} {config.tokenSymbol}
          </Text>
        </Box>
        <Box ml={5} mr={5} w={"50%"} align='center'>
          <Text color='#E5E5E5' fontSize={{ base: "xl" }}>
            In Bank {(+safeBalances).toFixed(4) > goal && " (Goal reached)"}
          </Text>
          <Text color={config.mainColor} fontSize={{ base: "2xl", lg: "5xl" }}>
            {safeBalances && (
              <span>{`${(+safeBalances).toFixed(4)} ${
                config.tokenSymbol
              }`}</span>
            )}
          </Text>
        </Box>
        <Box ml={5} mr={5}>
          <Text color='#E5E5E5' fontSize={{ base: "xl" }}>
            Your Power
          </Text>
          <Text color={config.mainColor} fontSize={{ base: "2xl", lg: "5xl" }}>
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
          justifyContent='center'
          align='center'
        >
          <Box>
            <Text fontSize='2xl' color='#E5E5E5'>
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
        <Box w='100%'>
          <Flex backgroundColor='#0C0C0C' flexDirection={"column"}>
            {safeTxInfo &&
              safeTxInfo?.map((tx, idx) => (
                <Flex
                  justifyContent='space-between'
                  w='100%'
                  align='center'
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
                      !tx.tokenAddress
                        ? `${config.tokenSymbol}`
                        : `w${config.tokenSymbol}`
                    }`}</Text>
                  </Box>
                  <Box ml={10}>
                    <Text fontSize={"lg"} color={"#E5E5E5"}>
                      {new Date(tx.executionDate).toLocaleString()}
                    </Text>
                  </Box>
                  <Box m={10}>
                    <Text fontSize={"lg"} color={config.mainColor}>
                      {tx.transactionHash.substring(0, 6) +
                        "..." +
                        tx.transactionHash.substring(60)}
                      <CopyToast toCopy={tx.transactionHash} />
                    </Text>
                  </Box>
                </Flex>
              ))}
          </Flex>
        </Box>
      </Flex>
      {/* <Button onClick={()=> setToggleList(true)}>vlivk</Button> */}
    </>
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
      size='xs'
      fontSize='16px'
      fontWeight='normal'
      margin={5}
      padding={4}
      backgroundColor={config.mainColor}
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
  const launch = config.launch;
  const difference = +new Date(launch) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      Minutes: Math.floor((difference / 1000 / 60) % 60),
      Seconds: Math.floor((difference / 1000) % 60),
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
      provider.provider.on("chainChanged", (chainId) => {
        window.location.reload();
      });
    };
    setup();
  }, [provider]);

  const timerComponents = Object.keys(timeLeft).map((interval, idx) => {
    return (
      <VStack padding={{ base: "4", lg: 10 }} key={idx}>
        <Text
          color={config.mainColor}
          fontSize={{ base: "3xl", lg: "5xl" }}
          lineHeight='1'
        >
          {timeLeft[interval] || "0"}
        </Text>
        <Text color={"#E5E5E5"} fontSize='sm'>
          {interval}
        </Text>
      </VStack>
    );
  });

  return (
    <ChakraProvider resetCSS>
      <Box backgroundColor='#0C0C0C' minH='100vh'>
        <Stack spacing={2}>
          <Stack spacing={2}>
            <Flex justifyContent='space-between' alignItems='center' p={0}>
              <ArrowForwardIcon p={0} />
              <Flex
                justifyContent='flex-end'
                alignItems='center'
                p={0}
                w='30%'
              />
              <WalletButton
                provider={provider}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
              />
            </Flex>
            <Flex
              direction={{ base: "column", lg: "row" }}
              alignItems='center'
              justifyContent='center'
            >
              <Avatar size='2xl' backgroundColor='#0C0C0C' src={config.logo} />
              <Flex color={config.mainColor} alignItems='center' wrap={{ base: "wrap", lg: "nowrap" }}>
                {timerComponents.length ? (
                  timerComponents
                ) : (
                  <span>Time's up!</span>
                )}
              </Flex>
            </Flex>
            <Box
              justifyContent='center'
              paddingX={{ base: 4, lg: 20 }}
              paddingBottom={8}
            >
              <Text paddingBottom={2} align='center' color={"#E5E5E5"}>
                Yeet ({config.network}) funds to:{" "}
              </Text>
              <Flex
                direction='row'
                alignItems='center'
                justifyContent='center'
                rounded='16px'
                backgroundColor='#0C0C0C'
                border={"solid"}
                borderColor={config.mainColor}
                borderWidth={"thin"}
                padding={{ base: "4", lg: "5" }}
              >
                {timerComponents.length ? (
                  <Flex
                    alignItems='center'
                    justifyContent='center'
                    wrap={{ base: "wrap", lg: "nowrap" }}
                    maxWidth='100%'
                  >
                    <Text
                      fontSize={{ base: "lg", md: "2xl" }}
                      align='center'
                      color={config.mainColor}
                      width='100%'
                    >
                      {config.gnosisSafe}
                    </Text>
                    <CopyToast toCopy={config.gnosisSafe} />
                  </Flex>
                ) : (
                  <Text color={config.mainColor}>Done. LFG</Text>
                )}
              </Flex>
            </Box>
            <SafeList provider={provider} />
            <HStack
              color={config.mainColor}
              justifyContent={{ base: "center", lg: "flex-end" }}
              spacing={{ base: "2", lg: "4" }}
              paddingRight={{ base: "0", lg: "20" }}
              paddingTop={{ base: "2", lg: "6" }}
              paddingBottom={{ base: "4", lg: "8" }} // need to find the additional margin={2} so we can remove this
            >
              <Text>
                <Link href={config.website} isExternal>
                  More about {config.projectName} <ExternalLinkIcon mx='2px' />
                </Link>
              </Text>
              <Text>
                <Link href={"https://daohaus.club/"} isExternal>
                  Bolt on for DAOhaus <ExternalLinkIcon mx='2px' />
                </Link>
              </Text>
            </HStack>
          </Stack>
        </Stack>
      </Box>
    </ChakraProvider>
  );
}

export default App;
