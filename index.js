var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import 'dotenv/config'; // You will need to run `npm install dotenv` to use this
import { Auth, ENFT } from 'enft'; // Change the path to 'enft' if you are using the package
import 'dotenv/config';
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import * as dotenv from 'dotenv';
console.log("Loading setup.js");
dotenv.config();
const SECRETS = [
    "CONTRACT_ADDRESS",
    "ALCHEMY_API_KEY",
    "ETHERSCAN_API_KEY",
    "OPENSEA_API_KEY",
    "CONTRACT_ADDRESSES",
    "TWITTER_ENABLED",
    "TWITTER_API_KEY",
    "TWITTER_API_SECRET",
    "TWITTER_ACCESS_TOKEN",
    "TWITTER_ACCESS_SECRET",
    "DISCORD_ENABLED",
    "WEBHOOK_URL",
];
const NO_ENV_FILE = process.env[SECRETS[5]] === undefined;
const _env = {};
function getSecretsFromEnvFile() {
    for (const secret of SECRETS) {
        if (!(secret in _env)) {
            _env[secret] = process.env[secret];
        }
    }
}
function getSecretsFromKms() {
    return __awaiter(this, void 0, void 0, function* () {
        // Use this code snippet in your app.
        // If you need more information about configurations or implementing the sample code, visit the AWS docs:
        // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
        const secret_name = "RKL_SALES_BOT_ENV";
        const client = new SecretsManagerClient({
            region: "us-east-1",
        });
        let response;
        try {
        }
        catch (error) {
            // For a list of exceptions thrown, see
            // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
            throw error;
        }
        // Your code goes here
        try {
            const getSecretValueResponse = response = yield client.send(new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            }));
            const secretString = getSecretValueResponse.SecretString;
            const kmsSecrets = JSON.parse(secretString);
            for (const secret of SECRETS) {
                if (!(secret in _env)) {
                    _env[secret] = kmsSecrets[secret];
                }
            }
        }
        catch (e) {
            if (e instanceof Error) {
                throw e;
            }
            else {
                throw new Error(JSON.stringify(e));
            }
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (NO_ENV_FILE) {
        yield getSecretsFromKms();
    }
    else {
        getSecretsFromEnvFile();
    }
}))();
// Required settings
const CONTRACT_ADDRESS = _env["CONTRACT_ADDRESS"]
    ? _env["CONTRACT_ADDRESS"].toLowerCase()
    : '';
const CONTRACT_ADDRESSES = _env["CONTRACT_ADDRESSES"]
    ? _env["CONTRACT_ADDRESSES"].toLowerCase()
    : '';
const ALCHEMY_API_KEY = _env["ALCHEMY_API_KEY"] || '';
const ETHERSCAN_API_KEY = _env["ETHERSCAN_API_KEY"] || '';
// Optional settings
const OPENSEA_API_KEY = _env["OPENSEA_API_KEY"] || '';
// Twitter api settings if enable (optional)
const TWITTER_API_KEY = _env["TWITTER_API_KEY"] || '';
const TWITTER_API_SECRET = _env["TWITTER_API_SECRET"] || '';
const TWITTER_ACCESS_TOKEN = _env["TWITTER_ACCESS_TOKEN"] || '';
const TWITTER_ACCESS_SECRET = _env["TWITTER_ACCESS_SECRET"] || '';
// Discord webhook settings if enable (optional)
const WEBHOOK_1 = _env["WEBHOOK_URL"] || '';
// Set up the Auth with the provider api keys (at least one is required)
const auth = new Auth({
    alchemy: {
        apiKey: ALCHEMY_API_KEY || ''
    }
});
// Create the ENFT object with the Auth
const enft = new ENFT(auth);
// Discord webhook is optional
const discordWebhook = WEBHOOK_1 || '';
// Twitter config is optional
const twitterConfig = {
    appKey: TWITTER_API_KEY || '',
    appSecret: TWITTER_API_SECRET || '',
    accessToken: TWITTER_ACCESS_TOKEN || '',
    accessSecret: TWITTER_ACCESS_SECRET || ''
};
// Etherscan api key is optional for eth to usd conversion
const etherscanApiKey = ETHERSCAN_API_KEY || '';
// Required
const contractAddress = CONTRACT_ADDRESS || '';
console.log({
    contractAddress: contractAddress,
    etherscanApiKey: etherscanApiKey,
    discordWebhook: discordWebhook,
    twitterConfig: twitterConfig,
    test: true
});
enft.onItemSold({
    contractAddress: contractAddress,
    etherscanApiKey: etherscanApiKey,
    discordWebhook: discordWebhook,
    twitterConfig: twitterConfig // Optional
}, (txData) => {
    if (txData.swap) {
        console.log('--------------------------------------------------------------------------------');
        console.log(`${txData.contractData.name} Swap on NFTTrader.io`);
        console.log(`Maker: ${txData.swap.maker.name}`);
        console.log(`Spent Assets: ${JSON.stringify(txData.swap.maker.spentAssets, null, 2)}`);
        console.log(`Spent Value: ${txData.swap.maker.spentAmount} ETH`);
        console.log('🔄');
        console.log(`Taker: ${txData.swap.taker.name}`);
        console.log(`Spent Assets: ${JSON.stringify(txData.swap.taker.spentAssets, null, 2)}`);
        console.log(`Spent Value: ${txData.swap.taker.spentAmount} ETH`);
        console.log(`\nhttps://etherscan.io/tx/${txData.transactionHash}`);
        console.log('--------------------------------------------------------------------------------');
    }
    else {
        console.log(`${txData.totalAmount} ${txData.contractData.name} sold on ${txData.interactedMarket.displayName} for ${txData.totalPrice} ${txData.currency.name}`);
        console.log(`https://etherscan.io/tx/${txData.transactionHash}\n`);
    }
});
