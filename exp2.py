from pymerkle import InmemoryTree as MerkleTree, verify_inclusion
from pymerkle.proof import InvalidProof
from pymerkle.hasher import MerkleHasher
import hashlib, time

# ------------------------------------------------------
# TASK 1: Build Merkle Tree (11 Transactions)
# ------------------------------------------------------
transactions = [
    b"Tx1: A pays B 10 BTC",
    b"Tx2: B pays C 5 BTC",
    b"Tx3: C pays D 2 BTC",
    b"Tx4: D pays E 1 BTC",
    b"Tx5: X pays Y 3 BTC",
    b"Tx6: Y pays Z 4 BTC",
    b"Tx7: M pays N 8 BTC",
    b"Tx8: N pays O 6 BTC",
    b"Tx9: O pays P 9 BTC",
    b"Tx10: P pays Q 7 BTC",
    b"Tx11: Q pays R 11 BTC"
]

tree = MerkleTree(algorithm="sha256")
for tx in transactions:
    tree.append_entry(tx)

root = tree.get_state()
print("Merkle Root (11 TX):", root.hex())

# ------------------------------------------------------
# TASK 2: Verify Transaction #2
# ------------------------------------------------------
index = 2
leaf = tree.get_leaf(index)
proof = tree.prove_inclusion(index)

try:
    verify_inclusion(leaf, root, proof)
    print("Original Tx2 → Verification SUCCESS")
except InvalidProof:
    print("Original Tx2 → Verification FAIL")

# Tamper Tx2
tampered_tx = b"Tx2: B pays C 50 BTC"
tampered_leaf = MerkleHasher(tree.algorithm, tree.security).hash_raw(tampered_tx)

try:
    verify_inclusion(tampered_leaf, root, proof)
    print("Tampered Tx2 → UNEXPECTED SUCCESS !!!")
except InvalidProof:
    print("Tampered Tx2 → Verification FAILED (correct)")

# ------------------------------------------------------
# TASK 3: Build a Simple Block
# ------------------------------------------------------
def build_block(idx, txs, prev_hash):
    t = MerkleTree(algorithm="sha256")
    for tx in txs:
        t.append_entry(tx)

    merkle_root = t.get_state().hex()
    header = f"{idx}{time.time()}{prev_hash}{merkle_root}"
    block_hash = hashlib.sha256(header.encode()).hexdigest()
    return merkle_root, block_hash

genesis = "0" * 64
root1, block1_hash = build_block(1, transactions, genesis)

print("\nBlock 1 Root:", root1)
print("Block 1 Hash:", block1_hash)

# ------------------------------------------------------
# TASK 4: Tampering Detection (11 TX)
# ------------------------------------------------------
tampered_txs = transactions.copy()
tampered_txs[1] = tampered_tx   # modify Tx2

root2, block2_hash = build_block(2, tampered_txs, block1_hash)

print("\nTampered Block Root:", root2)
print("Tampered Block Hash:", block2_hash)

print("\nMerkle Roots match? →", root1 == root2)
print("Tampering detected? →", root1 != root2)
