# got wind?
A visual wind and weather forecast app built for kiteboarders and other wind sport enthusiasts.

#### SVG map of United States
US state boundary shapefiles from [US Census Bureau](https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html) (500k), converted to GeoJSON with:
```
ogr2ogr -f GeoJSON states.json cb_2015_us_state_500k.shp
```

#### Helpful links
* [Let's Make a Map](https://bost.ocks.org/mike/map/)
* [D3.slider Tutorial](http://sujeetsr.github.io/d3.slider/)
