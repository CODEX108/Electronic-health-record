### **Hyperledger Fabric – Lab 6**
#  **STEP 0 — Install prerequisites**
Run:

```bash
sudo apt update
sudo apt install -y curl wget git docker.io docker-compose build-essential
```

Enable Docker:
```bash
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

Logout and login again OR run:

```bash
newgrp docker
```

Check Docker:

```bash
docker --version
docker ps
```

---

#  **STEP 1 — Download Fabric binaries + samples**

Official script:

```bash
curl -sSL https://bit.ly/2ysbiFn | bash -s
```

This creates:

```
~/fabric-samples/
~/bin/
```

---

#  **STEP 2 — Set environment variables**

Add to PATH:

```bash
export PATH=$PATH:$HOME/bin
export FABRIC_CFG_PATH=$HOME/fabric-samples/config
```

(Optional: permanently add to ~/.bashrc)

```bash
echo 'export PATH=$PATH:$HOME/bin' >> ~/.bashrc
echo 'export FABRIC_CFG_PATH=$HOME/fabric-samples/config' >> ~/.bashrc
source ~/.bashrc
```

Verify:

```bash
peer version
```

You should see:

```
Version: 2.5.x
```

---

#  **STEP 3 — Bring up the test network**

Go to test-network folder:

```bash
cd ~/fabric-samples/test-network
```

Start network:

```bash
./network.sh up
```

You should see messages like:

```
Creating peer0.org1.example.com
Creating orderer.example.com
Network is up
```

---

# **STEP 4 — Create a channel**

```bash
./network.sh createChannel
```

---

#  **STEP 5 — Deploy chaincode (smart contract)**

Example chaincode: **basic asset transfer**

Install + instantiate:

```bash
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go/ -ccl go
```

---

#  **STEP 6 — Interact with network**

Setup env for Org1:

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/
. ./scripts/envVar.sh
setGlobals 1
```

Query all assets:

```bash
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}'
```

Put asset:

```bash
peer chaincode invoke -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile $ORDERER_CA \
  -C mychannel -n basic \
  -c '{"Args":["CreateAsset","asset1","blue","20","Tom","500"]}'
```

---

#  **STEP 7 — Bring network down**

```bash
./network.sh down
```
