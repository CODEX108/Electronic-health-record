console.log('--- SERVER.JS (FINAL VERSION FROM GEMINI) ---'); // ADDED FOR VERIFICATION

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const { Web3 } = require('web3');

const app = express();
const port = 3000;

// --- Configuration ---
const MONGO_URL = 'mongodb://localhost:27017/EHR';
const DB_NAME = 'EHR';
const COLLECTION_NAME = 'records';
const ETHEREUM_NODE_URL = 'http://127.0.0.1:7545';
const CONTRACT_ADDRESS = '0x84a28D93DF28464537f7aD272C64c7fcC4509e81';
const CONTRACT_ABI = require('./abi.json');

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database and Web3 Connection ---
let db;
let recordsCollection;
let web3;
let agentContract;

(async () => {
    try {
        const client = await MongoClient.connect(MONGO_URL);
        db = client.db(DB_NAME);
        recordsCollection = db.collection(COLLECTION_NAME);
        console.log('Successfully connected to MongoDB Atlas.');

        web3 = new Web3(ETHEREUM_NODE_URL);
        agentContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        console.log('Successfully connected to Ethereum node.');

    } catch (err) {
        console.error('Failed to connect to services:', err);
        process.exit(1);
    }
})();

// --- API Routes ---

// [POST] /api/register - This is the route that was previously missing.
app.post('/api/register', async (req, res) => {
    console.log('Received POST request on /api/register'); // ADDED FOR DEBUGGING
    const { patientAddress, content } = req.body;
    if (!patientAddress || !content) {
        return res.status(400).json({ success: false, message: 'patientAddress and content are required.' });
    }

    try {
        const newRecord = {
            patientAddress: patientAddress.toLowerCase(),
            content: content,
            lastUpdated: new Date()
        };
        await recordsCollection.insertOne(newRecord);
        console.log(`Record created in MongoDB for ${patientAddress}`);
        res.status(201).json({ success: true, message: 'Record created successfully.' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Error creating record.' });
    }
});

app.get('/api/records/:patientAddress', async (req, res) => {
    const patientAddress = req.params.patientAddress.toLowerCase();
    const requesterAddress = req.query.requester ? req.query.requester.toLowerCase() : null;

    try {
        let hasPermission = false;
        const requester = requesterAddress || patientAddress;

        if (requester.toLowerCase() === patientAddress.toLowerCase()) {
            hasPermission = true;
        } else {
            hasPermission = await agentContract.methods.hasAccess(requester, patientAddress).call();
        }

        if (!hasPermission) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const record = await recordsCollection.findOne({ patientAddress: patientAddress });
        if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
        
        res.json({ success: true, content: record.content });
    } catch (error) {
        console.error('Get Record Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching record.' });
    }
});

app.post('/api/records/:patientAddress', async (req, res) => {
    const patientAddress = req.params.patientAddress.toLowerCase();
    const { content, doctorAddress } = req.body;

    if (!content || !doctorAddress) {
        return res.status(400).json({ success: false, message: 'Content and doctorAddress are required.' });
    }

    try {
        const hasPermission = await agentContract.methods.hasAccess(doctorAddress.toLowerCase(), patientAddress).call();
        if (!hasPermission) {
            return res.status(403).json({ success: false, message: 'Authorization failed.' });
        }

        const result = await recordsCollection.updateOne(
            { patientAddress: patientAddress },
            { $set: { content: content, lastUpdated: new Date() } }
        );

        if (result.matchedCount === 0) return res.status(404).json({ success: false, message: 'Record not found.' });
        
        res.json({ success: true, message: 'Record updated successfully.' });
    } catch (error) {
        console.error('Update Record Error:', error);
        res.status(500).json({ success: false, message: 'Error updating record.' });
    }
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});