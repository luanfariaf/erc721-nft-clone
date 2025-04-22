const hre = require("hardhat");

async function main() {
  const contractAddress = "CONTRACT_ADDRESS";
  const ShadowNFT = await hre.ethers.getContractAt("ShadowNFT", contractAddress);

  const tx = await ShadowNFT.mint(
    "ADDRESS_TO",
    "https://my-json-ipfs.com/metadata/1"
  );

  await tx.wait();
  console.log("NFT minted with success!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})