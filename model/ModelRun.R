library(tidyverse)
library(httr)
source("InstallPackages.R")

modeldata = read.csv("ModelData/modeldata.csv")
modeldata$Date <- as.Date(modeldata$Date)

forecaststart = read.csv("ModelData/forecaststart.csv")

# get a list of previously trained models
previous_models <- Sys.glob(file.path("ModelData","*.rds")) %>%
map((function(x) unlist(str_extract(x, "\\d{4}-\\d{2}-\\d{2}"))[1])) %>%
map((function(x) as.Date(x, format="%Y-%m-%d"))) 

# IF there are no previously saved models, load in all the data and train
if( length(previous_models) == 0){
  #First model has no "region" effect
  model5name <- paste("ModelData/stanmodel",Sys.Date(),".rds",sep="")
  model5 <- stan_lmer(log(Confirmed) ~ Exposure + lnsdi + lnurban + lnp70p +
                        lnhhsn + lnihr2018 + lnsqualty + (Exposure|Country_Region),
                      data=modeldata, chains=1, iter=5000, warmup=1000)
  saveRDS(model5,model5name)
}else{
  most_recent_model <- previous_models[which.max(previous_models)]
  most_recent_data  <- filter(modeldata, Date > most_recent_model[[1]])

  model5 = readRDS(file.path("ModelData", paste("stanmodel",format(most_recent_model[[1]],format='%Y-%m-%d'),".rds",sep="")))
  update(model5,data = most_recent_data, chains=1, iter=1000,warmup=500)
  model5name <- paste("ModelData/stanmodel",Sys.Date(),".rds",sep="")
  saveRDS(model5,model5name)
}

# Make forecasts with this model.
forecastpredict <- posterior_predict(model5,forecaststart %>% na.omit())
forecaststan <- na.omit(forecaststart)
forecastestimate <- data.frame(Est=apply(forecastpredict,2,mean),Var=apply(forecastpredict,2,sd),
                               Country=forecaststan$Country_Region,Date=forecaststan$Date) %>% 
  mutate(Upper=Est+2*Var,Lower=Est-2*Var)

#Save for app.
write.csv(forecastestimate,"ModelData/forecastestimates.csv")
POST(
  "https://ts-africa-covid.herokuapp.com/model",
  body = upload_file("forecastestimates.csv")
)
