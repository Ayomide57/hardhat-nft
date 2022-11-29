import {HardhatRuntimeEnvironment} from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, network } from "hardhat";
import 'dotenv/config';
import networkConfig, { developmentChains } from '../helper-hardhat-config';
import verify from '../utils/verify';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; 


const deployBasicNFT: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log('-------------------------------------------------------------------------------------');

    const args: any = [];
    const basicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 5
    });

    if (!developmentChains.includes(network.name) && ETHERSCAN_API_KEY) {
        await verify(basicNFT.address, args)
    }

    log('-------------------------------------------------------------------------------------');



    
}

export default deployBasicNFT;
deployBasicNFT.tags = ["all", "basicNFT", "main"];
