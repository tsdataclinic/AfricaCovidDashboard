#!/bin/bash

docker run -it --rm \
--mount source="$(pwd)"/ModelData,target=/models/ModelData/,type=bind \
--mount source="$(pwd)"/ModelRun.R,target=/models/ModelRun.R,type=bind \
covid-model Rscript ModelPipeline.R
