import pinataSDK from '@pinata/sdk';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';


const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);


const storeImagesToPinata = async (imageFilePath: string) => {
    const fullImagesPath = path.resolve(imageFilePath);
    const files = fs.readdirSync(fullImagesPath);
    let responses = [];

    let fileIndex: string;
    console.log('-----------Upload to IPFS----------------');
    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
        const options = {
            pinataMetadata: {
                name: files[fileIndex],
            },
        };


        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile, options);
            responses.push(response);
        } catch (error) {
            console.log(error);
        }
    }

    console.log('--------------------------------iiiiiiii-----------------------------------------------------');

    return {responses, files}


}

export async function storeTokenUriMetaData(metadata: any) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata);
        return response;
    } catch (error) {
        console.log(error)
    }
    return null;
}


export default storeImagesToPinata;