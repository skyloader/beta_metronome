# Deployment Guide

## Method 1: Git Clone (Recommended for Development)

### On Source PC
```bash
cd ~/workspace/pi_workspace/beta_metronome

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/beta_metronome.git

# Push to remote
git push -u origin master
```

### On Target PC
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/beta_metronome.git
cd beta_metronome

# Install dependencies
npm install

# Copy token.info from source PC (if not in repo)
# Create token.info with your Tastytrade credentials
cat > token.info << EOF
client_secret: YOUR_CLIENT_SECRET
client_ID: YOUR_CLIENT_ID
refresh_token: YOUR_REFRESH_TOKEN
EOF

# Build and run
npm run build
npm start
```

## Method 2: Docker Deployment (Recommended for Production)

### Build Docker Image
```bash
cd ~/workspace/pi_workspace/beta_metronome
docker build -t beta-metronome .
```

### Run with Docker
```bash
# Create token.info first
cat > token.info << EOF
client_secret: YOUR_CLIENT_SECRET
client_ID: YOUR_CLIENT_ID
refresh_token: YOUR_REFRESH_TOKEN
EOF

# Run container
docker run -d \
  --name beta-metronome \
  -p 3001:3001 \
  -v $(pwd)/token.info:/app/token.info \
  beta-metronome
```

### With Docker Compose
```bash
docker-compose up -d
```

## Method 3: Direct File Copy

```bash
# On source PC
cd ~/workspace/pi_workspace/beta_metronome

# Create tarball
tar -czf beta-metronome.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=frontend/node_modules \
  --exclude=frontend/dist \
  .

# Copy to target PC and extract
tar -xzf beta-metronome.tar.gz
cd beta_metronome
npm install
npm run build
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default: 3001) |
| `NODE_ENV` | Environment (development/production) |

## Notes

- `token.info` contains sensitive API credentials - never commit to public repos
- Use `gitignore` to keep `token.info` out of version control
- For production, consider using environment variables or secret managers
