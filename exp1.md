# LAB 1 – BLOCKCHAIN PRIMITIVES  
*(OpenSSL 3.x only – 2024/25 SAFE commands)*

Run every step on a fresh folder.  
All commands are copy-paste ready for Linux / macOS / WSL.

---

## ✅ TASK 1 – AES-256-CBC (SYMMETRIC)
**Goal:** Encrypt a file with a password so that **only the password** can decrypt it.

| What you type | Why it matters |
|--------------|----------------|
| `echo "This is my AES encryption test" > plain.txt` | Create a tiny secret. |
| `openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in plain.txt -out encrypted.bin` | **Modern** encryption.  <br>-pbkdf2 = key-stretching <br>-iter 100k = 0.1 s brute-force tax <br>-salt = no rainbow tables |
| `openssl enc -aes-256-cbc -d -pbkdf2 -iter 100000 -in encrypted.bin -out decrypted.txt` | Decrypt (must repeat **exact** flags). |
| `cat decrypted.txt` | Should show the original sentence. |

---

## ✅ TASK 2 – RSA PUBLIC-KEY (ASYMMETRIC)
**Goal:** Encrypt with **public** key, decrypt with **private** key (no shared password).

| Step | Command |
|------|---------|
| 1. Generate 2048-bit key pair | `openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048` |
| 2. Extract public key | `openssl pkey -in private.pem -pubout -out public.pem` |
| 3. Encrypt small message | `echo "RSA TESTING" > message.txt` <br>`openssl pkeyutl -encrypt -inkey public.pem -pubin -in message.txt -out encrypted_rsa.bin -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256` |
| 4. Decrypt | `openssl pkeyutl -decrypt -inkey private.pem -in encrypted_rsa.bin -out decrypted_rsa.txt -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256` |
| 5. Check | `cat decrypted_rsa.txt` |

---

## ✅ TASK 3 – DIGITAL SIGNATURE (RSA + SHA-256)
**Goal:** Prove a file came from you (integrity + authenticity).

| Action | Command |
|--------|---------|
| Sign | `openssl dgst -sha256 -sign private.pem -out signature.bin message.txt` |
| Verify | `openssl dgst -sha256 -verify public.pem -signature signature.bin message.txt` |
| Expected output | `Verified OK` |

---

## ✅ TASK 4 – SELF-SIGNED CERTIFICATE
**Goal:** Bind your name to your public key (useful for local TLS, blockchain nodes, etc.).

| Step | Command |
|------|---------|
| 1. New private key | `openssl genpkey -algorithm RSA -out server.key -pkeyopt rsa_keygen_bits:2048` |
| 2. Certificate request | `openssl req -new -key server.key -out server.csr` <br>*(fill fields; Common Name = your name or `localhost`)* |
| 3. Self-sign for 1 year | `openssl req -x509 -key server.key -in server.csr -days 365 -out server.crt` |
| 4. Inspect | `openssl x509 -in server.crt -text -noout` |

---

## 📝 Notes
* AES-256-CBC ➜ `openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 …`  
* RSA encrypt ➜ `pkeyutl -encrypt -pubin -pkeyopt rsa_padding_mode:oaep …`  
* RSA sign ➜ `dgst -sha256 -sign …`  
* Self-signed cert ➜ `req -x509 -key … -days 365 …`
