import {HardhatRuntimeEnvironment} from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, network } from "hardhat";
import 'dotenv/config';
import networkConfig, { developmentChains } from '../helper-hardhat-config';
import verify from '../utils/verify';
import fs from "fs";


const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; 

const deployDynamicNFT: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;
    let ethUsdFeedFeedAddress;

    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");
        ethUsdFeedFeedAddress = EthUsdAggregator.address;
    } else {
        ethUsdFeedFeedAddress = networkConfig[chainId].ethUsdFeedFeed;
    }

    log('-----------------------------------dynamicSvgNft--------------------------------------------------');

    const lowSVG = await fs.readFileSync("./images/DynamicNFTs/frown.svg", {encoding: "utf8"});
    const highSVG = await fs.readFileSync("./images/DynamicNFTs/happy.svg", { encoding: "utf8" });

    const args = [ethUsdFeedFeedAddress, lowSVG, highSVG];

    const dynamicSvgNft = await deploy("DynamicSvgNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 5
    });

    if (!developmentChains.includes(network.name) && ETHERSCAN_API_KEY) {
        console.log("Verifying ----")
        await verify(dynamicSvgNft.address, args)
    }

    log('-------------------------------------------------------------------------------------');
}


export default deployDynamicNFT; 

deployDynamicNFT.tags = ["all", "dynamicft", "main"];
