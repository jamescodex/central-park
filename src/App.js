import React from "react";
import { Notification } from "./components/ui/Notifications";
import { useBalance, useParkContract } from "./hooks";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Container, Nav } from "react-bootstrap";
import Cover from "./components/minter/Cover";
import Nfts from "./components/minter/nfts";
import Wallet from "./components/Wallet"
import "./App.css";


const App = function AppWrapper() {
  const { address, destroy, connect } = useContractKit();
  const { balance, getBalance } = useBalance();
  // initialize contract
  const parkContract = useParkContract();

  return (
    <>
      <Notification />
      {address ? (
        <Container fluid="md">
          <Nav className="justify-content-end pt-3 pb-5">
            <Nav.Item>              
              <Wallet
                address={address}
                amount={balance.CELO}
                symbol="CELO"
                destroy={destroy}
              />
            </Nav.Item>
          </Nav>
          <main>            
            <Nfts
              name="Central Park Collection"
              updateBalance={getBalance}              
              parkContract={parkContract}
            />
          </main>
        </Container>
      ) : (
        //  if user wallet is not connected display cover page
        <Cover
          name="Hello there, you are welcome to central park collection. Explore!"
          coverImg="https://wallpaperaccess.com/full/1826326.jpg"
          connect={connect}
        />
      )}
    </>
  );
};

export default App;
