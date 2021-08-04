FROM rocker/tidyverse

RUN apt-get -y update && apt-get -y install gcc-7 g++-7 gfortran-7 libglpk-dev libnode-dev
RUN mkdir /models
RUN mkdir /models/ModelData

WORKDIR /models

ADD InstallPackages.R ./
RUN Rscript InstallPackages.R

ADD ModelData/WPP2019_TotalPopulationBySex.csv /models/ModelData/WPP2019_TotalPopulationBySex.csv
ADD ModelData/testfile.csv /models/ModelData/testfile.csv
ADD ModelData/popdata.csv /models/ModelData/popdata.csv
ADD ModelData/covid_data.csv /models/ModelData/covid_data.csv
ADD ModelData/forecaststart.csv /models/ModelData/forecaststart.csv

ADD *.R ./
