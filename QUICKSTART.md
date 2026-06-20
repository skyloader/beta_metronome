# Quick Start Guide

## Other PC Setup

### Method 1: Docker (Recommended)

```bash
# Clone repository
git clone git@github.com:skyloader/beta_metronome.git
cd beta_metronome

# Create token.info with your Tastytrade API credentials
cat > token.info << EOF
{
  "token": "your_tastytrade_token",
  "api-url": "https://api.tastytrade.com",
  "websocket-url": "wss://streamer.tastytrade.com"
}
EOF

# Build and run
docker-compose up -d

# Access at
open http://localhost:5173
```

### Method 2: npm

```bash
# Clone repository
git clone git@github.com:skyloader/beta_metronome.git
cd beta_metronome

# Install dependencies
npm install

# Run server
node dist/server.js &

# Run frontend
npm run dev
```

## GitHub Repository

- SSH: `git@github.com:skyloader/beta_metronome.git`
- HTTPS: `https://github.com/skyloader/beta_metronome.git`
