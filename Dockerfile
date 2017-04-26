# Mock ENV for cross build MT7688
#
# Pull base image.
FROM ubuntu:14.04
# Install.
RUN \
  sed -i 's/# \(.*multiverse$\)/\1/g' /etc/apt/sources.list && \
  apt-get update && \
  apt-get -y upgrade && \
  apt-get install -y build-essential && \
  apt-get install -y python && \
  apt-get install -y software-properties-common && \
  apt-get install -y byobu curl git htop man unzip vim wget && \
  rm -rf /var/lib/apt/lists/*
# Set environment variables.
ENV HOME /root
# Define working directory.
WORKDIR /root
# Install NVM, Node v0.12.7 and NPM v2.11.3
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
ENV \
  NVM_DIR=/root/.nvm \
  NODE_VERSION=v0.12.7
RUN \ 
  . $HOME/.nvm/nvm.sh && \
  nvm install $NODE_VERSION && \
  nvm alias default $NODE_VERSION && \
  nvm use default && \
  npm install -g npm@2.11.3
# Clone MT7688 cross-build repo and build enviornment.
RUN \
  git clone https://github.com/simenkid/mt7688-cross.git && \
  cd mt7688-cross && \
  bash create_env.sh
# Define default command.
CMD ["bash"]
