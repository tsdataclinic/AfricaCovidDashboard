packages <- c("tidyverse","lubridate","Matrix", "lme4","Rcpp","rstanarm", "magrittr","abind","httr")

installed <- packages %in% rownames(installed.packages())
if (any(installed == FALSE)) {
  install.packages(packages[!installed], repos = "http://cran.us.r-project.org")
}

invisible(lapply(packages,library,character.only=T))
