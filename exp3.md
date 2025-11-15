Create a file:

```
blockchain_lab.py
```

Paste this:

```python
import hashlib
import time

# ---------------------------------------------------
# TASK 1: BUILD A SIMPLE BLOCKCHAIN
# ---------------------------------------------------

class Block:
    def __init__(self, index, data, prev_hash, difficulty=4):
        self.index = index
        self.timestamp = time.time()
        self.data = data
        self.prev_hash = prev_hash
        self.difficulty = difficulty
        self.nonce, self.hash = self.proof_of_work()

    def compute_hash(self, nonce):
        block_string = f"{self.index}{self.timestamp}{self.data}{self.prev_hash}{nonce}"
        return hashlib.sha256(block_string.encode()).hexdigest()

    def proof_of_work(self):
        prefix = "0" * self.difficulty
        nonce = 0

        while True:
            hash_value = self.compute_hash(nonce)
            if hash_value.startswith(prefix):
                return nonce, hash_value
            nonce += 1


class Blockchain:
    def __init__(self, difficulty=4):
        self.chain = []
        self.difficulty = difficulty
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis = Block(0, "Genesis Block", "0" * 64, self.difficulty)
        self.chain.append(genesis)

    def add_block(self, data):
        prev_hash = self.chain[-1].hash
        block = Block(len(self.chain), data, prev_hash, self.difficulty)
        self.chain.append(block)
        return block


# ---------------------------------------------------
# TASK 2: DEMONSTRATE BLOCKCHAIN WORKING
# ---------------------------------------------------

# Create blockchain with difficulty = 4
blockchain = Blockchain(difficulty=4)

print("\n--- Adding Blocks to Blockchain ---")
b1 = blockchain.add_block("A pays B 10 BTC")
b2 = blockchain.add_block("B pays C 5 BTC")

for block in blockchain.chain:
    print(f"\nBlock {block.index}")
    print("Timestamp:", block.timestamp)
    print("Data:", block.data)
    print("Prev Hash:", block.prev_hash)
    print("Nonce:", block.nonce)
    print("Hash:", block.hash)


# ---------------------------------------------------
# TASK 3 & 4: CRYPTOGRAPHIC PUZZLES (POW)
# Find nonce for prefix: 4 zeros AND 5 zeros
# ---------------------------------------------------

def find_nonce_for_prefix(prefix_zeros):
    prefix = "0" * prefix_zeros
    nonce = 0
    message = "SolvePuzzle"

    print(f"\nSolving puzzle for prefix: {prefix} ...")

    while True:
        attempt = f"{message}{nonce}"
        hash_value = hashlib.sha256(attempt.encode()).hexdigest()
        if hash_value.startswith(prefix):
            print(f"Found! Nonce = {nonce}, Hash = {hash_value}")
            return nonce, hash_value
        nonce += 1

# Solve for 4 zeros
find_nonce_for_prefix(4)

# Solve for 5 zeros
find_nonce_for_prefix(5)
```

---


### **Task 1 – Build a Blockchain**

* Defines `Block` class
* Each block stores:

  * index
  * timestamp
  * data
  * previous hash
  * difficulty
  * nonce
  * hash (after mining)

### **Task 2 – Demonstrate Blockchain Working**

* Creates a blockchain instance
* Adds sample transactions
* Prints:

  * Nonce
  * Block hash
  * Previous hash
  * Full block contents

### **Task 3 – Solve Cryptographic Puzzle**

* SHA-256 hashing puzzle
* Keep increasing nonce until the hash begins with a target prefix

### **Task 4 – Find Nonce for 4-zeros and 5-zeros**

* Calls `find_nonce_for_prefix(4)`
* Calls `find_nonce_for_prefix(5)`

You get **correct PoW solution output**.
