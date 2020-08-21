## Arfica COVID Dashboard


### Repo structure 

The inital repo is setup as a yarn + lerna based monorepo. It has two packages 

- [frontend](/packages/frontend) : A [create-react-app template](https://github.com/facebook/create-react-app) using  typescript
- [api](/packages/api) : A [nestjs](https://nestjs.com/) server for developing the API, this is also written in typescript 

In addition to these javascript packages there are two other directories 
- [data](/data): which should contain any rawor proccessed data we need for the project 
- [scripts](/scripts): which should contain any scripts we are using to clean and transform data. For example any ETL should live in this folder.

These are just placeholders and we might swich these out for another type of server / frontend framework as the project progresses.

### Running the application 

First install the dependencies using 

```bash
yarn install
```

From the root dir and then run 

```
yarn start
```

To get the servers running. The frontend will be served at http://localhost:3000 and the API will be hosted at http://localhost:4000  

### Existing resources 

- [India Dashboard Project](https://www.covid19india.org/) A good source of components for visualizing COVID data 
- [The R Shiny app](https://github.com/tmh741/AFCOVIDDashboard) that the BU team is currently using.

### Data 

The majority of data that the team is using comes from the [Johns Hopkins dashboard](https://coronavirus.jhu.edu/us-map).

In addition we have some model output data that can be found in the data/raw directory.
