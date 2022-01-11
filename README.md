# CoMeds

CoMeds is an e-Commerce Website built to provide a common platform between the medicine, oxygen-cylinders and other medical equipments suppliers and the patients in need.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Your machine should have Npm( or Yarn ) and Node.js installed to use it locally.

## Setup and Installation

### Setting up the repository locally

 1. First fork 🍴 the repo to your account.

    Go to the forked repo and clone it 👥 to your local machine.

    ` git clone https://github.com/Your_Username/comeds-hf21.git `
    
    This will make a copy of the code to your local machine.

 2. Now move to the `comeds-hf21` directory.

    ` cd comeds-hf21 `

 3. Now check the remote of your local code by:

    ` git remote -v `

    The response should look like:

    ```
    origin https://Your_Username/comeds-hf21.git (fetch)

    origin https://Your_Username/comeds-hf21.git (push) 
    ```

    To add upstream to remote, run: 

     `git remote add upstream https://github.com/arkarn04/comeds-hf21.git`

    Again run `git remote -v`, the rrsponse should look like: 

    ```
    origin https://Your_Username/comeds-hf21.git (fetch)

    origin https://Your_Username/comeds-hf21.git (push)
      
    upstream https://github.com/arkarn04/comeds-hf21 (fetch)

    upstream https://github.com/arkarn04/comeds-hf21 (push)
    ```

 4. Once the remote is set, install all the necessary dependencies by the following comand: 
    
    `npm install-all`

## Run locally

Run the below command to start the server

`npm run start`

Go to: http://localhost:5000

