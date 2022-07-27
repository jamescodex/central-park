const hre = require("hardhat");

async function main() {
  const ParkNft = await hre.ethers.getContractFactory("CentralPark");
  const parkNft = await ParkNft.deploy();
  await parkNft.deployed();
  console.log("Contract is now deployed to:", parkNft.address);
  storeContractData(parkNft);
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/ParkNft-address.json",
    JSON.stringify({ Park: contract.address }, undefined, 2)
  );

  const data = artifacts.readArtifactSync("CentralPark");

  fs.writeFileSync(
    contractsDir + "/ParkNft-data.json",
    JSON.stringify(data, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });