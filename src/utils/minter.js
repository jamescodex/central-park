import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { ethers } from "ethers";

// initialize IPFS
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

// function to mint NFT
export const addToken = async (
  parkContract,
  performActions,
  { name, description, price, ipfsImage, attributes }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !price || !ipfsImage) {
      alert("Fill all input fields first!");
    }
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      description,
      image: ipfsImage,
      owner: defaultAccount,
      attributes,
    });

    try {
      // save NFT metadata to IPFS
      const added = await client.add(data);
      // IPFS url for uploaded metadata
      const tokenUri = `https://ipfs.infura.io/ipfs/${added.path}`;
      // mint the NFT and save the IPFS url to the blockchain
      const _price = ethers.utils.parseUnits(String(price), "ether");
      let txn = await parkContract.methods
        .addTokenToPark(_price, tokenUri)
        .send({ from: defaultAccount });
    } catch (error) {
      console.log(error);
    }
  });
};

// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const added = await client.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  } catch (error) {
    console.log("Error uploading file: ", +error);
  }
};

// function to get tokens from park contract
export const getTokens = async (parkContract) => {
  try {
    const tokens = [];
    const length = await parkContract.methods.tokensCount().call();
    for (let i = 0; i < Number(length); i++) {
      let token = await new Promise(async (resolve) => {
        let _token = await parkContract.methods.getParkToken(i).call();
        console.log(_token);
        const _tokenUri = await parkContract.methods.tokenURI(_token[0]).call();
        const meta = await fetchNftMeta(_tokenUri);
        resolve({
          id: _token[0],
          seller: _token[1],
          owner: _token[2],
          price: _token[3],
          sold: _token[4],
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
          attributes: meta.data.attributes,
        });
      });
      tokens.push(token);
    }
    return Promise.all(tokens);
  } catch (e) {
    console.log("error loading tokens: " + e);
  }
};

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    return meta;
  } catch (e) {
    console.log("Error uploading file: ", +e);
  }
};

// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log("Error uploading file: ", +e);
  }
};

// function to purchase a token from park
export const buyToken = async (parkContract, performActions, tokenId) => {
  try {
    await performActions(async (kit) => {
      try {
        const { defaultAccount } = kit;
        const token = await parkContract.methods.getParkToken(tokenId).call();
        await parkContract.methods
          .buyParkToken(tokenId)
          .send({ from: defaultAccount, value: token.price });
      } catch (error) {
        console.log("error while buying token: " + error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// function to sell token to park
export const sellToken = async (parkContract, performActions, tokenId) => {
  try {
    await performActions(async (kit) => {
      try {
        const { defaultAccount } = kit;
        const txn = await parkContract.methods
          .sellParkToken(tokenId)
          .send({ from: defaultAccount });
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// function to send token as gift to another user
export const giftToken = async (
  parkContract,
  performActions,
  receiver,
  tokenId,
  message
) => {
  if (!receiver || !message) {
    alert("fill all fields first");
    return;
  }
  try {
    await performActions(async (kit) => {
      try {
        const { defaultAccount } = kit;
        const txn = await parkContract.methods
          .giftToken(receiver, tokenId, message)
          .send({ from: defaultAccount });
        console.log(txn);
      } catch (error) {
        console.log("Error gifting token: " + error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
