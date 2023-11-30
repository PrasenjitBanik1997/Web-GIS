import Feature from 'ol/Feature';
import Circle from 'ol/geom/Circle';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Stroke, Fill } from 'ol/style';


export const createCircleVectorLayerFromTheCoordinate = (centerCoordinates, radiusInMeters) => {
    // Create a circle based on the center and radius
    const circleGeometry = new Circle(centerCoordinates, Number(radiusInMeters));

    // Convert the circle geometry to a feature
    const circleFeature = new Feature(circleGeometry);

    // Create a vector source and add the circle feature to it
    const vectorSource = new VectorSource({
      features: [circleFeature],
    });

    // Create a vector layer with the vector source
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'blue', // Change the color as needed
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)', // Change the fill color and opacity as needed
        }),
      }),
      zIndex:2
    });
    return vectorLayer;
}