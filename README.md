# Qubit-Force

# 1. 🎯 Objective

To design and implement a quantum-secured, blockchain-backed citizen hotline that allows users to:

Anonymously file sensitive reports (abuse, corruption, emergencies).

Chat securely in real-time with multiple agencies (police, NGOs, legal aid).

Visually understand how QKD protects them via BB84/B92 simulations.

Ensure transparency & trust via blockchain-based audit logs.

This project demonstrates a fusion of Quantum Cryptography + Post-Quantum Encryption + Blockchain + AI-driven usability, making it future-proof and socially impactful.

# 2. ⚡ Problem Statement

Citizens hesitate to report abuse/disasters due to fear of surveillance, tampering, or insider leaks.

Current hotlines are centralized and vulnerable to hacks.

Future quantum computers will break existing encryption methods.

Lack of visible proof of security lowers trust in systems.

No two-way secure communication between citizens and agencies.

# 3. 💡 Solution Overview

The platform combines:

Quantum Key Distribution (QKD) Simulation – BB84/B92 with Qiskit to generate encryption keys, detect eavesdropping (via QBER spikes), and visualize quantum steps.

Post-Quantum Cryptography (PQC) – CRYSTALS-Kyber/Dilithium for future-proof encryption.

Blockchain – Immutable audit trails (report logs, chat metadata) on Polygon Mumbai testnet.

Secure Chat – End-to-end encrypted real-time messaging between citizens and agencies.

Multi-Channel Access – Web app, SMS/USSD for low-internet areas, AI-powered voice bot for illiterate citizens.

Attack Lab – Judges can toggle "Eavesdropper" → QBER rises, session fails; or "Data Tampering" → blockchain proves immutability.

# 4. 📌 Key Features
🔐 Report Filing

Citizen logs in with pseudonym.

Submits a report (text/voice).

Report encrypted with PQC keys.

Hash stored on blockchain for tamper-proof proof.

💬 Secure Chat

Real-time chat between citizen & agencies.

Each conversation uses QKD session key (simulated with Qiskit).

PQC for message encryption.

Chat metadata (time, sender role) logged on blockchain.

🧑‍🤝‍🧑 Multi-Agency Collaboration

Police, NGO, legal aid get redacted views.

Threshold cryptography ensures sensitive info requires multi-agency approval.

🔭 Visualization Dashboard

QKD Simulation (Qiskit):

Show basis choices, qubit transmission, sifting, error detection.

QBER calculation live.

Attack Lab:

Toggle "Eavesdropper" → QBER spikes.

Toggle "Data deletion" → blockchain audit log shows immutability.

🗣️ Multi-Channel Input

Web App: Main UI (React + Tailwind).

SMS/USSD: For rural users (gateway API).

AI Voice Bot: Whisper + GPT → converts speech → encrypted report.

# 5. 🛠️ Tech Stack
Frontend

React + Tailwind → UI

D3.js/Chart.js → QKD & QBER visualizations

Socket.IO → Real-time chat

Backend

Flask/Django (Python) → APIs

PyCryptodome + PQClean → PQC encryption

WebSockets → Chat system

Quantum

Qiskit (IBM Quantum) → simulate BB84, B92, QBER detection

Blockchain

Polygon Mumbai Testnet → immutable logs

Web3.py / Ethers.js → blockchain integration

AI

Whisper → voice-to-text (offline, free)

GPT (local/fine-tuned) → pseudonym generation + urgency detection

# 6. 🚀 Workflow
🟢 Step 1: Citizen Report

Citizen logs in → pseudonym assigned (AI-generated).

Fills report (text/voice/SMS).

Backend runs QKD (Qiskit) simulation → generates session key.

Report encrypted with PQC (Kyber).

Hash pushed to Polygon testnet for immutability.

🟢 Step 2: Secure Chat

Chat initiated → session key derived from QKD simulation.

All messages encrypted PQC + session key.

Real-time communication via Socket.IO.

Chat metadata logged on blockchain (hash + timestamp).

🟢 Step 3: Agency View

Police → case ID + location.

NGO → victim support details.

Legal Aid → evidence.

Multi-agency unlock required for sensitive fields.

🟢 Step 4: Visualization & Attack Lab

Dashboard shows live BB84 simulation with qubits & bases.

Attack toggle:

Eavesdropper → QBER spike → session aborted.

Data tampering → blockchain immutability shown.

# 7. 🎯 Hackathon MVP Demo (24–36 hrs)

✅ Citizen submits encrypted report (text/voice).
✅ QKD dashboard (Qiskit) shows secure key exchange.
✅ Report hash on Polygon Mumbai proves immutability.
✅ Secure chat enabled → PQC + QKD session key.
✅ Attack Lab → Judges toggle “eavesdropper” → QBER spike → secure session abort.
✅ Citizen checks blockchain log → “Police accessed at 12:31 PM”.

# 8. 📈 Impact

Social Impact: Safe reporting for vulnerable citizens.

Govt Impact: Tamper-proof, trust-building system.

Tech Impact: Combines Quantum + PQC + Blockchain + AI.

Hackathon Appeal: Highly visual, interactive, and futuristic MVP.
