# got wind?
A visual wind and weather forecast app built for kiteboarders and other wind sport enthusiasts.

#### SVG map of United States
US state boundary shapefiles from [US Census Bureau](https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html) (500k), converted to GeoJSON with:
```
ogr2ogr -f GeoJSON states.json cb_2015_us_state_500k.shp
```

#### Meteorological data
GFS 0.25 degree data downloaded from [NOAA NOMADS](http://nomads.ncep.noaa.gov/) and converted to JSON using [grib2json](https://github.com/cambecc/grib2json) utility:
```
curl "http://nomads.ncep.noaa.gov/cgi-bin/filter_wave.pl?file=nah.t00z.grib.grib2&lev_surface=on&var_WIND=on&var_WVDIR=on&var_WVHGT=on&var_WVPER=on&subregion=&leftlon=-81&rightlon=-70&toplat=40&bottomlat=30&dir=%2Fmulti_2.20160912" -o waveData.grb2
grib2json -d -n -o waveData.json waveData.grb2
```

#### Resources
* [Let's Make a Map](https://bost.ocks.org/mike/map/)
* [D3.slider Tutorial](http://sujeetsr.github.io/d3.slider/)
* [Weather Icons](https://erikflowers.github.io/weather-icons/)
