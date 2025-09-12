# Overview

Qubit Force is a secure whistleblowing/reporting platform that demonstrates advanced cryptographic security measures. The application allows users to submit anonymous reports while protecting their data through post-quantum cryptography, quantum key distribution simulation, and blockchain verification. It features a modern web interface built with React and TypeScript, backed by an Express.js server with real-time chat capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with a dark theme color scheme optimized for security applications
- **State Management**: TanStack Query for server state management with custom query client
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket integration for secure chat functionality

## Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL with Neon serverless database
- **WebSocket**: Native WebSocket server for real-time encrypted chat
- **Security Services**: 
  - Post-Quantum Cryptography service simulating Kyber-1024 and Dilithium-3 algorithms
  - Quantum Key Distribution service implementing BB84 protocol simulation
  - Blockchain service for immutable report logging and verification

## Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless with Drizzle ORM
- **Schema Design**: Four main tables - reports, chat_messages, quantum_keys, and blockchain_logs
- **Encryption**: All sensitive data is encrypted before database storage using PQC algorithms
- **Memory Storage**: Fallback in-memory storage implementation for development/testing

## Authentication and Authorization
- **Session Management**: Session-based authentication with connect-pg-simple for session storage
- **Anonymity**: Reports can be submitted without authentication to protect whistleblower identity
- **Secure Chat**: WebSocket connections use session-based identification for encrypted communications

## Security Architecture
- **Post-Quantum Cryptography**: Simulated implementation of NIST-approved algorithms (Kyber-1024 for key exchange, Dilithium-3 for signatures)
- **Quantum Key Distribution**: BB84 protocol simulation for demonstrating quantum-safe key generation
- **Blockchain Integration**: Simulated blockchain for tamper-proof report logging and integrity verification
- **End-to-End Encryption**: All report data and chat messages are encrypted before transmission and storage

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database platform for production data storage
- **Drizzle Kit**: Database migration and schema management tool

## UI and Styling
- **Radix UI**: Comprehensive set of accessible UI components
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast development server and build tool with React plugin
- **TypeScript**: Type-safe development with comprehensive type checking
- **ESBuild**: Fast JavaScript bundler for production builds

## Real-time Communication
- **WebSocket**: Native WebSocket implementation for secure chat functionality
- **TanStack Query**: Server state synchronization and caching

## Cryptographic Libraries
- **Node.js Crypto**: Built-in cryptographic functions for hashing and encryption
- **Custom PQC Implementation**: Simulated post-quantum cryptographic algorithms (production would use liboqs or similar)

## Form Handling and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation and schema validation
- **@hookform/resolvers**: Integration layer between React Hook Form and Zod