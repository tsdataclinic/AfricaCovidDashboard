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

For an example of the model outputs + some other data files look at the summary here : 
- [Model output data summary](/data/raw/test/summary.md)

Some variables additionally come from the Institute of Health Metrics and Evaluation (IHME),  Population Reference Bureau 

### Model specifications 

#### IV Regression Model

```r
model <- ivreg(lncaseload_lastobs ~ lnrchange + lnexpo + lnsdi + lnurban + lnp70p +
                 lnhhsn + lnihr2018 + lnsqualty + lnasthma + lnhiv  | 
                 lnexpo + lnsdi + lnurban + lnp70p +
                 lnhhsn + lnihr2018 + lnsqualty + lnasthma + lnhiv + lntraffic,data= modeldata)
```

- lnrchange : Change in cases between the first two weeks of the virus ?
- lnexpo : Inital expansion factor of the virus ?
- lnsdi : socio demographic index
- lnurban : Urbanisation of the country
- lnp70p: Age profile ?
- lnhhsn : Average household size
- lnihr2018 : Adherance to international Health regulation
- lnsqualty :health care quality index.
- lnasthma  : Prevalance of Asthma (from Institute of Health Metrics and Evaluation (IHME))
- lnhiv : Prevalance of HIV (from Institute of Health Metrics and Evaluation (IHME))  
- lntraffic : Incoming air traffic
