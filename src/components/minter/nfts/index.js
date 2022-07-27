import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { Row } from "react-bootstrap";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
  getTokens,
  addToken,
  buyToken,
  sellToken,
  giftToken,
} from "../../../utils/minter";
import AddNfts from "./Add";
import Nft from "./Card";
import Gift from "./Gift"
import Loader from "../../ui/Loader";

const NftList = ({ name, parkContract }) => {
  /* performActions : used to run smart contract interactions in order
   *  address : fetch the address of the connected wallet
   */
  const { performActions, address } = useContractKit();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  // load tokens from contract
  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      const parkTokens = await getTokens(parkContract);
      if (!parkTokens) return;
      setTokens(parkTokens);
    } catch (error) {
      console.log("Error uploading file: ", + error);
    } finally {
      setLoading(false);
    }
  }, [parkContract]);

  const addTokenToPark = async (data) => {
    try {
      setLoading(true);
      await addToken(parkContract, performActions, data);
      toast(<NotificationSuccess text="Loading NFT list...." />);
      loadAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create an NFT." />);
    } finally {
      setLoading(false);
    }
  };

  // function to buy token from park
  const buyParkToken = async (tokenId) => {
    try {
      setLoading(true);
      await buyToken(parkContract, performActions, tokenId);
      toast(<NotificationSuccess text="Loading NFTs...." />);
      loadAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to buy NFT!" />);
    } finally {
      setLoading(false);
    }
  };

  // function to re-sell park token
  const sellParkToken = async (tokenId) => {
    try {
      setLoading(true);
      await sellToken(parkContract, performActions, tokenId);
      toast(<NotificationSuccess text="Loading NFTs...." />);
      loadAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to sell NFT!" />);
    } finally {
      setLoading(false);
    }
  };

  // send token as gift to another user
  const giftParkToken = async (receiver, tokenId, message) => {
    try {
      setLoading(true);
      await giftToken(parkContract, performActions, receiver, tokenId, message);
      toast(<NotificationSuccess text="Loading NFTs...." />);
      loadAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to gift token!" />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      if (address && parkContract) {
        loadAssets();
      }
    } catch (error) {
      console.log("Error uploading file: ", + error );
    }
  }, [parkContract, address, loadAssets]);
  if (address) {
    return (
      <>
        {!loading ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="fs-4 fw-bold mb-0">{name}</h1>

              <AddNfts add={addTokenToPark} address={address} />
            </div>
            <Row xs={1} sm={2} lg={4} className="g-3  mb-5 g-xl-4 g-xxl-5">
              {/* display all NFTs */}
              {tokens.map((token) => (
                <Nft
                  key={token.id}                  
                  isOwner={token.owner === address}
                  data={{...token}}
                  buyToken={buyParkToken}
                  sellToken={sellParkToken}
                  giftToken={giftParkToken}
                  defaultAccount={address}
                />
              ))}
            </Row>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {
  // props passed into this component
  minterContract: PropTypes.instanceOf(Object),
  marketplaceContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
  minterContract: null,
  marketplaceContract: null,
};

export default NftList;
