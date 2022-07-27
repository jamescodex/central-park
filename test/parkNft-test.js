const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CentralPark", function () {
  this.timeout(50000);

  let nft;
  let owner;
  let acc1;
  let acc2;

  this.beforeEach(async function () {
    // This is executed before each test
    // Deploying the smart contract
    const ParkNft = await ethers.getContractFactory("CentralPark");
    [owner, acc1, acc2] = await ethers.getSigners();
    nft = await ParkNft.deploy();
  });

  it("should set the right owner", async function () {
    expect(await nft.owner()).to.equal(owner.address);
  });

  it("should mint one NFT to sender", async function () {
    expect(await nft.balanceOf(acc1.address)).to.equal(0);    

    const tokenURI = "https://example.com/1";
    const price = "2000000000000000000"
    const tx = await nft.connect(acc1).addTokenToPark(price, tokenURI);
    await tx.wait();

    expect(await nft.balanceOf(nft.address)).to.equal(1);
  });

  it("should set the correct tokenURI", async function () {
    const tokenURI_1 = "https://example.com/1";
    const tokenURI_2 = "https://example.com/2";
    const price = "2000000000000000000"

    const tx1 = await nft.connect(owner).addTokenToPark(price, tokenURI_1);
    await tx1.wait();
    const tx2 = await nft.connect(owner).addTokenToPark(price, tokenURI_2);
    await tx2.wait();

    expect(await nft.tokenURI(0)).to.equal(tokenURI_1);
    expect(await nft.tokenURI(1)).to.equal(tokenURI_2);
  });
});
