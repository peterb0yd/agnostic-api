###(this repository is no longer being maintained) 

# Agnostic-API

The goal for this project is to provide an agnostic backend-API without sacrificing performance or flexibility.

### Schemas

Each new web app built with this API must have it's own schema. The schema is used to validate the model data. Data can only be stored in the database if it has an associated model in the schema and passes the validations.

### Environment Variables

All credentials are stored in a `.env` file. This file is not stored in git. It must be created and stored on the server inside the root of the project directory. We are using the `dotenv` node module to preload the `.env` file variables. This allows us to access the environment variables stored in the `.env` file via the `process.env.<variable>` method without explicitly requiring the `dotenv` library in our source code and reading the `.env` file at runtime.

### Setup

1. Install docker ([Mac](https://docs.docker.com/docker-for-mac/install/), [Windows](https://docs.docker.com/docker-for-windows/install/), [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/))
2. Clone this repo somewhere on your local machine
3. Create a `.env` file and save it to the project root
4. Populate the `.env` with your accounts and passwords for each service using the `.env.example` as a template
5. Run `npm install`
6. Test the installation by running `npm run start_local`
7. Then, open a browser window and navigate to http://localhost:3000/users 
8. If you see the text: `{ path: "/users" }`, then everything worked!
