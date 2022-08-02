// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CentralPark is Ownable, ERC721URIStorage, ERC721Enumerable {
    using Counters for Counters.Counter;    
    Counters.Counter private idCounter;
    Counters.Counter private tokensSold;    

    // mapping to store all tokens
    mapping(uint256 => Token) private tokens;
    // struct to define a token type
    struct Token {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event ReturnExcessFunds(string);
    event GiftToken(address indexed to, uint256 tokenId, string message);    
    event CreateToken (
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    constructor() ERC721("Central Park", "CTP") {}   

    modifier onlyOwner(uint256 _tokenId){
        require(msg.sender == tokens[_tokenId].owner, "Only the owner can access this function");
        _;
    }
    // mint a new token for "msg.sender" and place in market for sale
    function addTokenToPark(uint256 _tokenPrice, string memory _tokenURI) public payable {  
        require(_tokenPrice > 0, "Please increase the token price");        
        uint256 _tokenId = idCounter.current();
        idCounter.increment();
        _mint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        // create new Token and add to tokens mapping
        tokens[_tokenId] = Token(
            _tokenId,
            payable(msg.sender),
            payable(address(this)),
            _tokenPrice,
            false
        );
        _transfer(msg.sender, address(this), _tokenId);  
        // emit token minted event
        emit CreateToken (
            _tokenId,
            msg.sender,
            address(this),
            _tokenPrice,
            false
        );        
    }

    // owner of token can call this funcion to put already minted token 
    // for sale in market
    function sellParkToken(uint256 _tokenId) public payable onlyOwner(_tokenId){
        // first validate if caller is owner of token
        tokensSold.decrement(); 
        Token storage token = tokens[_tokenId];
        token.owner = payable(address(this));                    
        token.seller = payable(msg.sender);
        token.sold = false;
        _transfer(msg.sender, address(this), _tokenId);
    }

    // buy a token from the list of tokens in the park
    function buyParkToken(
        uint256 _tokenId
    ) public payable {  
        uint tokenPrice = tokens[_tokenId].price;
        address tokenSeller = tokens[_tokenId].seller;
        // confirm if buyer is sending enough funds
        require(msg.value >= tokenPrice, "You did not send enough funds to buy token");
        require(msg.sender != tokenSeller, "You can't buy your own token");
        tokensSold.increment();
        uint256 extra = msg.value - tokenPrice;
        // transfer extra funds back to buyer if they sends excess funds by mistake
        if (extra > 0) {
            (bool reversed, ) = payable(msg.sender).call{value: extra}("");
            require(reversed, "failed to send funds");
            emit ReturnExcessFunds("Excess funds has been reversed back to your account");
        }
        // update token properties
        tokens[_tokenId].owner = payable(msg.sender);
        tokens[_tokenId].seller = payable(address(0));
        tokens[_tokenId].sold = true;        
        // tranfer token from contract to buyer
        _transfer(address(this), msg.sender, _tokenId);
        // pay token owner for their funds
        (bool success,) = payable(tokenSeller).call{value: tokenPrice}("");
        require(success, "failed to send funds");
    }

    // get a token from the park
    function getParkToken(uint256 _tokenId) public view returns (
        uint256 tokenId,
        address payable seller,
        address payable owner,
        uint256 price,
        bool sold
    ) {
        require(_tokenId < idCounter.current(), "Token does not exist in this park");
        Token memory parkToken = tokens[_tokenId];
        tokenId = parkToken.tokenId;
        seller = parkToken.seller;
        owner = parkToken.owner;
        price = parkToken.price;
        sold = parkToken.sold;
    }

    //Function using which the owner can change the price of tree
    function changePrice(uint256 _tokenId, uint256 _price) external onlyOwner(_tokenId){
        tokens[_tokenId].price = _price;
    }
    // gift a token to another user
    function giftToken(address _to, uint256 _tokenId, string memory _message) public payable onlyOwner(_tokenId){
        Token storage token = tokens[_tokenId];
        // first validate token information
        require(_to != address(0), "You can't gift this token to an empty address");
        // transfer token to receiver
        _transfer(msg.sender, _to, _tokenId);
        token.owner     = payable(_to);
        emit GiftToken(_to, _tokenId, _message);
    }

    // get count of tokens in park
    function tokensCount() public view returns (uint256) {
        return idCounter.current();
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

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
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}