// SPDX-License-Identifier: SEE LICENSE IN LICENSE

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSvgNFT is ERC721{

    uint256 private s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,"; 
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg, 
        string memory highSvg
    ) ERC721("Dynamic Svg NFT", "DSN"){
        s_tokenCounter = 0;
        i_lowImageURI = saveToImageURI(lowSvg);
        i_highImageURI = saveToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function saveToImageURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string (abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded ));
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(msg.sender, s_tokenCounter);
        emit CreatedNFT(s_tokenCounter, highValue);

    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query or non existent token");

        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI = i_lowImageURI;

        if(price >= s_tokenIdToHighValue[tokenId]){
            imageURI = i_highImageURI;
        }

        return string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',name(),
                            '","description":"An NFT that changes based on he chainlink Feed", ',
                            '"attribute":[{"trait_type": "coolness", "value": 100}], "image":"',
                            imageURI, '"}'
                        )
                    )
                )
            )
        );
    }
}

// call function is use to change the state of the blockchain
// staticcall function is use to call pure and view function like, 
//this type is fucntion can not change the state of blockchain


    // Remember this?
    // - In our {} we were able to pass specific fields of a transaction, like value.
    // - In our () we were able to pass data in order to call a specific function - but there was no function we wanted to call!
    // We only sent ETH, so we didn't need to call a function!
    // If we want to call a function, or send any data, we'd do it in these parathesis!

// function selector is the byte code (bytes4) computer readable form of a function e.g 0x567388

// function signature is the human readable form of a function e.g transfer(uint13 day)

// encodeWithSelector() function can be use to encode function with the parameters