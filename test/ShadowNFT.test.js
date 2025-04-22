const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShadowNFT", function () {
  let shadowNFT;
  let owner, addr1;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const ShadowNFT = await ethers.getContractFactory("ShadowNFT");
    shadowNFT = await ShadowNFT.deploy();
  });

  it("Should allow user mint max 5 NFTs per wallet", async () => {
    for (let i = 0; i < 5; i++) {
      await shadowNFT.connect(addr1).mintClone(`https://example.com/metadata/${i}`);
    }

    await expect(
      shadowNFT.connect(addr1).mintClone("https://example.com/overflow")
    ).to.be.revertedWith("Max mint reached");
  });

  it("Should allow user burn one NFT and then allow to add a new one", async () => {
    await shadowNFT.connect(addr1).mintClone("https://example.com/1");
    await shadowNFT.connect(addr1).burn(0);
    await shadowNFT.connect(addr1).mintClone("https://example.com/2");

    expect(await shadowNFT.ownerOf(1)).to.equal(addr1.address);
  });

  it("Should return only active NFTs on getMyTokens", async () => {
    await shadowNFT.connect(addr1).mintClone("https://example.com/1");
    await shadowNFT.connect(addr1).mintClone("https://example.com/2");

    await shadowNFT.connect(addr1).burn(0);

    const tokens = await shadowNFT.connect(addr1).getMyTokens();
    expect(tokens.length).to.equal(1);
    expect(tokens[0]).to.equal(1);
  });
});
