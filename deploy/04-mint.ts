import {HardhatRuntimeEnvironment} from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, network } from "hardhat";
import 'dotenv/config';
import networkConfig, { developmentChains } from '../helper-hardhat-config';
import fs from "fs";

const mintAllNft: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;

    // basic NFT

    const basicNft = await ethers.getContract("BasicNFT", deployer);
    const basicMintTx = await basicNft.mintNFT();
    await basicMintTx.wait(1);
    console.log(`Basic NFT index 0 has tokenURL: ${await basicNft.tokenURI(0)}`);

    // Random IPFS NFT


    // Dynamic Nft

    const highvalue = ethers.utils.parseEther("4000");
    const dynamicNft = await ethers.getContract("DynamicSvgNFT", deployer);
    const dynamicNftTx = await dynamicNft.mintNft(highvalue.toString());
    await dynamicNftTx.wait(1);
    console.log(`Dynamic NFT index 0 has tokenURL: ${await dynamicNft.tokenURI(1)}`);
}

export default mintAllNft;

mintAllNft.tags = ["all", "mint"];

