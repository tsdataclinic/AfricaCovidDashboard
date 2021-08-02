FROM rocker/tidyverse

RUN apt-get -y update && apt-get -y install gcc-7 g++-7 gfortran-7 libglpk-dev libnode-dev
RUN mkdir /models
WORKDIR /models
ADD *.R ./
RUN Rscript InstallPackages.R