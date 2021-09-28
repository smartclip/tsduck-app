# **tsduck collection**

Repo to contain tsduck bindings, backend and frontend code.

<br>

# :telescope: Overview

This Repository contains frontend and backend code to use some tsp plugins.

<br>

# 🐛 Getting Started

## Requirements

tsduck (>3.26-2349) `sudo apt install -y ./tsduck-dev_3.26-2349.raspbian10_armhf.deb`\
npm\
nodejs\
node-gyp
tsduck javascript bindings

## Installing

### 1. N-API-Bindings: Install & Link

```sh
# tsduck/src/libtsduck/javascript

npm ci # install modules and build the napi bindings
npm link # link the bindings
```

### 2a. Server: Data Directories:

```sh
# ./tsduck-app/server/

# note: the directories can also be named different. then the default .env file has to be changed

mkdir -p ./data/tmp
mkdir -p ./data/tsFiles/input # .env: DATA_INPUT_DIR
mkdir -p ./data/tsFiles/output # .env: DATA_OUTPUT_DIR
mkdir -p ./data/tsFiles/tuning # .env: TUNING_FILE_PATH
```

### 2b. Server: Install & Link

```sh
# ./tsduck-app/server/

npm ci # install the modules
npm link tsduck # link the bindings
```

### 3. Client: Install

```sh
# ./tsduck-app/client/

npm ci # install the modules
```

## Environment Variables

### Client

If needed, create an .env file in the root directory of the client and fill it with the environment variables.

| Variable                      | Description                             | Default               |
| ----------------------------- | --------------------------------------- | --------------------- |
| **REACT_APP_SERVER_URL**      | URL of the server                       | http://127.0.0.1:3001 |
| **FETCH_STATUS_INTERVAL_SEC** | fetch server status interval in seconds | 3                     |

### Server

_Option 1:_ Create an .env file in the root directory of the server and set the environmental variables.\
_Option 2:_ Edit the variables in the _config.ts_ in the root directory of the server.

| Variable               | Description                              | Default                          |
| ---------------------- | ---------------------------------------- | -------------------------------- |
| **SERVER_PORT**        | PORT of the server.                      | 3001                             |
| **DB_ADDRESS**         | Address of the mongo database (if used). | mongodb://127.0.0.1/my_database  |
| **TUNING_FILE_PATH**   | Tuning file for live input.              | data/tsFiles/tuning/channels.xml |
| **DELIVERY_SYSTEM**    | Delivery system for live input.          | DVB-T2                           |
| **DATA_INPUT_DIR**     | Directory to store the input ts files.   | data/tsFiles/input/              |
| **DATA_OUTPUT_DIR**    | Directory to store the output ts files.  | data/tsFiles/output/             |
| **SESSION_LENGTH_MIN** | session length in minutes                | 60                               |

<br>

# 🕹️ Functionalities

## tsduck-app

Currently implemented functionalities of the tsduck-app:

### Files

- **select** - Select ts files on the server.
- **upload** - Upload and store ts files on the server.
- **download** - Download generated ts files from the server.

### Input

- **file** - Choose a ts file on the server as input.
- **live** - Choose a DVB-T2 live stream as input.
- **service** - Zap on one service, create an SPTS.
- **infinite** - Infinitely repeat the cycle through all input plugins in sequence.

### Plugins

- **synchronize** - Regulate the flow to be synchronous with the Program Clock Reference (PCR) in the transport stream.
- **replace_ait** - Replace a selected AIT in the ts file.

### Output

- **drop** - Do not pass the edited ts file to somewhere else.
- **file** - Create a new ts file on the server as output.
- **live** - Set hidestick as output.

## napi-tsduck

Currently implemented N-API-Bindings for tsduck:

- **napiTsVersion.h** - binds the getStringVersion function
- **napiTsProcessor.h** - binds the tsTSProcessor
- **napiTsReport.h** - binds the tsReport (partial) to log the reported notes like tsp errors, json and xml results
- **napiTspWorker.cc** - used for the tsp start functions to start a new thread for the tsp work
