// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract ShadowNFT is ERC721, ERC721URIStorage, Ownable {
  uint256 private _tokenId;

  struct MintLog {
    uint256 tokenId;
    address minter;
    uint256 timestamp;
  }

  mapping(address => MintLog[]) public logs;
  mapping(address => uint256) public mintedCount;
  uint256 public constant MAX_MINTS = 5;

  constructor() ERC721("ShadowNFT", "Shadow") Ownable(msg.sender) {}

  function mint(address to, string memory _tokenURI) public onlyOwner {
    uint256 tokenId = _tokenId++;
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, _tokenURI);
    logs[to].push(MintLog(tokenId, to, block.timestamp));
  }

  function totalSupply() public view returns (uint256) {
    return _tokenId;
  }

  function mintClone(string memory _tokenURI) public {
    require(mintedCount[msg.sender] < MAX_MINTS, "Max mint reached");

    uint256 tokenId = _tokenId++;
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, _tokenURI);

    mintedCount[msg.sender]++;
    logs[msg.sender].push(MintLog(tokenId, msg.sender, block.timestamp));
  }

  function burn(uint256 tokenId) public {
    require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");

    _burn(tokenId);

    if (mintedCount[msg.sender] > 0) {
      mintedCount[msg.sender]--;
    }

    emit TokenBurned(msg.sender, tokenId, block.timestamp);
  }

  function getMyTokens() public view returns (uint256[] memory) {
    MintLog[] memory userLogs = logs[msg.sender];
    uint256 count;

    for (uint256 i = 0; i < userLogs.length; i++) {
        uint256 tokenId = userLogs[i].tokenId;
        try this.ownerOf(tokenId) returns (address owner) {
            if (owner == msg.sender) {
                count++;
            }
        } catch {}
    }

    uint256[] memory result = new uint256[](count);
    uint256 index;

    for (uint256 i = 0; i < userLogs.length; i++) {
        uint256 tokenId = userLogs[i].tokenId;
        try this.ownerOf(tokenId) returns (address owner) {
            if (owner == msg.sender) {
                result[index++] = tokenId;
            }
        } catch {}
    }

    return result;
  }


  receive() external payable {}
  fallback() external payable {}

  event TokenBurned(address indexed user, uint256 tokenId, uint256 timestamp);

  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
  {
      return super.tokenURI(tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
      public
      view
      override(ERC721, ERC721URIStorage)
      returns (bool)
  {
      return super.supportsInterface(interfaceId);
  }


}
