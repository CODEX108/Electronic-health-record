const Hapi = require('@hapi/hapi');
const { MongoClient } = require('mongodb');
const { Web3 } = require('web3');
const CONTRACT_ABI = require('./abi.json');

const MONGO_URL = 'mongodb://localhost:27017/EHR';
const DB_NAME = 'EHR';
const COLLECTION_NAME = 'records';
const ETHEREUM_NODE_URL = 'http://127.0.0.1:7545';
const CONTRACT_ADDRESS = '0x84a28D93DF28464537f7aD272C64c7fcC4509e81';

let db, recordsCollection, web3, agentContract;

(async () => {
    const client = await MongoClient.connect(MONGO_URL);
    db = client.db(DB_NAME);
    recordsCollection = db.collection(COLLECTION_NAME);

    web3 = new Web3(ETHEREUM_NODE_URL);
    agentContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: { cors: true }
    });

    // [POST] /api/register
    server.route({
        method: 'POST',
        path: '/api/register',
        handler: async (request, h) => {
            const { patientAddress, content } = request.payload;
            if (!patientAddress || !content) {
                return h.response({ success: false, message: 'patientAddress and content are required.' }).code(400);
            }
            try {
                const newRecord = {
                    patientAddress: patientAddress.toLowerCase(),
                    content: content,
                    lastUpdated: new Date()
                };
                await recordsCollection.insertOne(newRecord);
                return h.response({ success: true, message: 'Record created successfully.' }).code(201);
            } catch (error) {
                return h.response({ success: false, message: 'Error creating record.' }).code(500);
            }
        }
    });

    // [GET] /api/records/{patientAddress}
    server.route({
        method: 'GET',
        path: '/api/records/{patientAddress}',
        handler: async (request, h) => {
            const patientAddress = request.params.patientAddress.toLowerCase();
            const requesterAddress = request.query.requester ? request.query.requester.toLowerCase() : null;
            try {
                let hasPermission = false;
                const requester = requesterAddress || patientAddress;
                if (requester === patientAddress) {
                    hasPermission = true;
                } else {
                    hasPermission = await agentContract.methods.hasAccess(requester, patientAddress).call();
                }
                if (!hasPermission) {
                    return h.response({ success: false, message: 'Access denied.' }).code(403);
                }
                const record = await recordsCollection.findOne({ patientAddress: patientAddress });
                if (!record) return h.response({ success: false, message: 'Record not found.' }).code(404);
                return { success: true, content: record.content };
            } catch (error) {
                return h.response({ success: false, message: 'Error fetching record.' }).code(500);
            }
        }
    });

    // [POST] /api/records/{patientAddress}
    server.route({
        method: 'POST',
        path: '/api/records/{patientAddress}',
        handler: async (request, h) => {
            const patientAddress = request.params.patientAddress.toLowerCase();
            const { content, doctorAddress } = request.payload;
            if (!content || !doctorAddress) {
                return h.response({ success: false, message: 'Content and doctorAddress are required.' }).code(400);
            }
            try {
                const hasPermission = await agentContract.methods.hasAccess(doctorAddress.toLowerCase(), patientAddress).call();
                if (!hasPermission) {
                    return h.response({ success: false, message: 'Authorization failed.' }).code(403);
                }
                const result = await recordsCollection.updateOne(
                    { patientAddress: patientAddress },
                    { $set: { content: content, lastUpdated: new Date() } }
                );
                if (result.matchedCount === 0) return h.response({ success: false, message: 'Record not found.' }).code(404);
                return { success: true, message: 'Record updated successfully.' };
            } catch (error) {
                return h.response({ success: false, message: 'Error updating record.' }).code(500);
            }
        }
    });

    await server.start();
    console.log(`Hapi server listening at http://localhost:3000`);
})();