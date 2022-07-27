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

    // mapping to store all tokens
    mapping(uint256 => Token) private tokens;
    // struct to define a token type
    struct Token {
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event GiftToken(address indexed to, uint256 tokenId, string message);
    event CreateToken(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    constructor() ERC721("Central Park", "CTP") {}

    modifier checkPrice(uint256 _tokenPrice) {
        require(_tokenPrice > 0, "Please increase the token price");
        _;
    }

    modifier isOwner(uint _tokenId) {
        // first validate if caller is owner of token
        require(
            tokens[_tokenId].owner == msg.sender,
            "Only owner of token can sell token"
        );
        _;
    }

    /// @dev mints a new token for "msg.sender" and place in market for sale
    function addTokenToPark(uint256 _tokenPrice, string memory _tokenURI)
        external
        payable
        checkPrice(_tokenPrice)
    {
        require(bytes(_tokenURI).length > 0, "Empty token uri");
        uint256 _tokenId = idCounter.current();
        idCounter.increment();
        _mint(address(this), _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        // create new Token and add to tokens mapping
        tokens[_tokenId] = Token(
            payable(msg.sender),
            payable(address(this)),
            _tokenPrice,
            false
        );
        // emit token minted event
        emit CreateToken(
            _tokenId,
            msg.sender,
            address(this),
            _tokenPrice,
            false
        );
    }

    /**
     * @dev owner of token can call this funcion to put already minted token
     * for sale in market
     */
    function sellParkToken(uint256 _tokenId, uint _tokenPrice)
        external
        payable
        isOwner(_tokenId)
        checkPrice(_tokenPrice)
    {
        require(tokens[_tokenId].sold, "Token is already on sale");
        Token storage token = tokens[_tokenId];
        token.owner = payable(address(this));
        token.seller = payable(msg.sender);
        token.sold = false;
        token.price = _tokenPrice;
        _transfer(msg.sender, address(this), _tokenId);
    }

    /// @dev buy a token from the list of tokens in the park
    function buyParkToken(uint256 _tokenId) external payable {
        uint tokenPrice = tokens[_tokenId].price;
        // confirm if buyer is sending enough funds
        require(
            msg.value == tokenPrice,
            "You did not send enough funds to buy token"
        );
        address tokenSeller = tokens[_tokenId].seller;
        require(msg.sender != tokenSeller, "You can't buy your own token");
        // update token properties
        tokens[_tokenId].owner = payable(msg.sender);
        tokens[_tokenId].seller = payable(address(0));
        tokens[_tokenId].sold = true;
        tokens[_tokenId].price = 0;
        // tranfer token from contract to buyer
        _transfer(address(this), msg.sender, _tokenId);
        // pay token owner for their funds
        (bool success, ) = payable(tokenSeller).call{value: tokenPrice}("");
        require(success, "failed to send funds");
    }

    /// @dev cancel a sale of a token in the park
    function cancelSale(uint _tokenId) public payable {
        require(!tokens[_tokenId].sold, "Token is already on sale");
        require(tokens[_tokenId].seller == msg.sender, "Only seller can cancel the sale");
        Token storage token = tokens[_tokenId];
        token.owner = payable(msg.sender);
        token.seller = payable(address(0));
        token.sold = true;
        token.price = 0;
        _transfer(address(this), msg.sender, _tokenId);
    }

    /// @dev get a token from the park
    function getParkToken(uint256 _tokenId)
        public
        view
        returns (
            address payable seller,
            address payable owner,
            uint256 price,
            bool sold
        )
    {
        require(
            _tokenId < idCounter.current(),
            "Token does not exist in this park"
        );
        Token memory parkToken = tokens[_tokenId];

        seller = parkToken.seller;
        owner = parkToken.owner;
        price = parkToken.price;
        sold = parkToken.sold;
    }

    /// @dev gift a token to another user
    function giftToken(
        address _to,
        uint256 _tokenId,
        string calldata _message
    ) public payable isOwner(_tokenId) {
        require(
            _to != address(0),
            "You can't gift this token to an empty address"
        );
        tokens[_tokenId].owner = payable(_to);
        // transfer token to receiver
        _transfer(msg.sender, _to, _tokenId);
        emit GiftToken(_to, _tokenId, _message);
    }

    /// @dev get count of tokens in park
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
