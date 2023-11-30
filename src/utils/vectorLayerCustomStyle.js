import {Style, Fill, Circle } from 'ol/style';
import Stroke from 'ol/style/Stroke.js';



export const createStyle = (feature) => {
    
    const geometryType = feature.getGeometry().getType();
    if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      return new Style({
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.2)' // Red color for polygons
        }),
        stroke: new Stroke({
          color: 'red',
          width: 2
        })
      });
    } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      return new Style({
        stroke: new Stroke({
          color: 'green',
          width: 4
        })
      });
    } else if (geometryType === 'Point') {
      return new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: 'green'
          }),
          stroke: new Stroke({
            color: 'black',
            width: 2
          })
        })
      });
    }
  
    // Return a default style if geometry type is not recognized
    return new Style({
      // Define your default style here
    });
  }