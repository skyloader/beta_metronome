# Deployment Instructions

## Quick Start (New PC)

### 1. Clone the repository
```bash
git clone <YOUR_GIT_URL> beta_metronome
cd beta_metronome
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add Tastytrade API credentials
Create `token.info` file with your credentials:
```
client_secret: YOUR_CLIENT_SECRET
client_ID: YOUR_CLIENT_ID
refresh_token: YOUR_REFRESH_TOKEN
```

### 4. Build and run
```bash
npm run build
npm start
```

Or use Docker:
```bash
docker build -t beta-metronome .
docker run -d -p 3001:3001 -v $(pwd)/token.info:/app/token.info beta-metronome
```

## Git Repository Setup

If not using Git, copy these files to new PC:
- Source files: `src/`, `frontend/src/`
- Configuration: `package.json`, `tsconfig.json`
- Credentials: `token.info` (create on new PC)
