import pandas as pd 
import geopandas as gpd 
import country_converter as cc
from shapely.ops import cascaded_union
import topojson as tp
import json
import os 

def fetch_polygons():
    map_url = 'http://geonode.state.gov/geoserver/wfs?srsName=EPSG%3A4326&typename=geonode%3AGlobal_LSIB_Polygons_Detailed&outputFormat=json&version=1.0.0&service=WFS&request=GetFeature'
    if os.path.exists('countries.geojson'):
        return gpd.read_file('countries.geojson')
    else:
        world_polygons = gpd.read_file(map_url)
        world_polygons.to_file("countries.geojson", driver='GeoJSON')
        return world_polygons

def assign_iso_3(polys):
    return polys.assign(
        iso3= polys.COUNTRY_NA.apply(lambda x: cc.convert([x], to="ISO3")),
        continent = polys.COUNTRY_NA.apply(lambda x: cc.convert([x], to="Continent")),
        region = polys.COUNTRY_NA.apply(lambda x: cc.convert([x], to='UNregion'))
        )

def extract_africa(polys):
    return polys[polys.continent == 'Africa']

def merge_countries(polys):
    moroco = polys[polys.COUNTRY_NA=='Morocco'].iloc[0]
    western_saharah = polys[polys.COUNTRY_NA=='Western Sahara (disp)'].iloc[0]
    polys.at[moroco.name, 'geometry'] = cascaded_union([moroco.geometry,western_saharah.geometry])
    return polys[polys.COUNTRY_NA!='Western Sahara (disp)']

def simplify_geoms(polys):
    polys.geometry = polys.geometry.simplify(0.015, preserve_topology=True)
    return polys
if __name__ =='__main__':
    polys = (fetch_polygons()
            .pipe(assign_iso_3)
            .pipe(extract_africa)
            .pipe(merge_countries))

    polys.to_file("africa_large.geojson", driver="GeoJSON")

    with open("africa.topojson", 'w') as f:
        f.write(tp.Topology(data=polys, topology=True, toposimplify=0.2).to_json())
    
    polys = polys.pipe(simplify_geoms)

    polys.to_file("africa.geojson", driver="GeoJSON")