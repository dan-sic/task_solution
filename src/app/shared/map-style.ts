export const mapStyle = {
  sources: {
    OSMTile: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 20
    }
  },
  version: 8,
  layers: [{
    'id': 'OSMTile',
    'type': 'raster',
    'source': 'OSMTile',
    'layout': {},
    'paint': {
      'raster-fade-duration': 100
    }
  }],
  glyphs: '/assets/font/{fontstack}/{range}.pbf'
};
