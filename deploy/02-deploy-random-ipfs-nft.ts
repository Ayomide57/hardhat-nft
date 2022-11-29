import {HardhatRuntimeEnvironment} from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, network } from "hardhat";
import 'dotenv/config';
import networkConfig, { developmentChains } from '../helper-hardhat-config';
import verify from '../utils/verify';
import storeImagesToPinata, {storeTokenUriMetaData} from '../utils/UploadToPinata';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; 

const IMAGES_LOCATION = "./images/RandomNFTs";
const FUND_AMOUNT = "1000000000000000000000";

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: {
        trait_type: "Cuteness",
        value: 100
    }
}

const deployRandomIpfsNFT: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;

    let vrfCoordinatorV2Address, subscriptionId;
    let tokenUris = [
        "ipfs://QmafayrvSSZs8iMyFeWQxnqMZpPrc7vo6zFShQLXPCp8Ka",
        "ipfs://QmeydHc4kzwH1XAiLMg4k3wNMjHVw6652y8JGBHa46XYuA",
        "ipfs://Qma2WCtbkwFbDrSzfpnGz3r8CDmVBVJrQ7inqw6Ww1syiA"
    ];

    if (process.env.UPLOAD_TO_PINATA === "true") {
        tokenUris = await handleTokenUris();
    }

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await tx.wait(1);
        subscriptionId = txReceipt.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    log('-------------------------------------------------------------------------------------');

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ];

    const deployRandomIpfsNft = await deploy("RandomIpfsNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 5,
    })

    if (!developmentChains.includes(network.name) && ETHERSCAN_API_KEY) {
        await verify(deployRandomIpfsNft.address, args)
    }

    log('-------------------------------------------------------------------------------------');

}


async function handleTokenUris() {
    let tokenUris = [];

    const { responses: imageUploadResponses, files } = await storeImagesToPinata(IMAGES_LOCATION);
    let imageUploadResponseIndex: string;
    for (imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate };
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name}`;
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;

        console.log(`Uploading ${tokenUriMetadata.name}`);
        const metadatUploadResponse = await storeTokenUriMetaData(tokenUriMetadata);
        tokenUris.push(`ipfs://${metadatUploadResponse?.IpfsHash}`)
    }
    console.log("Token URI uploaded");
    console.log(tokenUris);
    return tokenUris
}


export default deployRandomIpfsNFT;
deployRandomIpfsNFT.tags = ["all", "randomnft", "main"];
