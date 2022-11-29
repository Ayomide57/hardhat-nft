import {HardhatRuntimeEnvironment} from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, network } from "hardhat";
import {
    developmentChains,
    BASE_FEE,
    GAS_PRICE_LINK
} from '../helper-hardhat-config';



const DECIMALS = "18";
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether");

const deployMocks: DeployFunction = async(hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const args = [BASE_FEE, GAS_PRICE_LINK]
 
    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks ...");

        await deploy("VRFCoordinatorV2Mock", {
            //contract: "VRFCoordinatorV2Mock",
            from: deployer,
            args: args,
            log: true
        }); 

        await deploy("MockV3Aggregator", {
            //contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_PRICE],
            log: true
        }); 

        log("Mock Deployed! ...");
        log("============================================================================");
    }
}

export default deployMocks;  

deployMocks.tags = ["all", "mocks", "main"]