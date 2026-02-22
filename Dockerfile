FROM node:20-slim

# Install Python and system dependencies for OCR
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install Dependencies (using install instead of ci avoids cross-platform package-lock issues)
RUN npm install
# Use --break-system-packages if pip complains on newer debian/ubuntu or use venv
# Here assuming simple container environment where system install is fine or handled
RUN pip3 install -r requirements.txt --break-system-packages

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 5000

# Start
# Start
COPY scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

CMD ["./scripts/start.sh"]
