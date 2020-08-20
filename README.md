## Arfica COVID Dashboard


### Repo structure 

The inital repo is setup as a yarn + lerna based monorepo. It has two packages 

- frontend : A create react app template using  typescript
- api : A nest.js server for developing the API, this is also written in typescript 

In addition to these javascript packages there are two other directories 
- data: which should contain any rawor proccessed data we need for the project 
- scripts: which should contain any scripts we are using to clean and transform data. For example any ETL should live in this folder.

These are just placeholders and we might swich these out for another type of server / frontend framework as the project progresses.

### Existing resources 

- [India Dashboard Project]() A good source of components for visualizing COVID data 
- [The R Shiny app]() that the BU team is currently using.

### Data 

The majority of data that the team is using comes from the [Johns Hopkins dashboard](https://coronavirus.jhu.edu/us-map).

In addition we have some model output data that can be found in the data/raw directory.
