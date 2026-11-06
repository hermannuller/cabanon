'use strict';
// OSM tag classification shared by the snapshot importer and offline enrichment.
module.exports=function kind(t){
 if(t.tourism==='hotel')return'hotel';if(t.tourism==='hostel')return'hostel';
 const amenities={cafe:'cafe',restaurant:'restaurant',pharmacy:'pharmacy',hospital:'hospital',school:'school',parking:'parking',fuel:'fuel',charging_station:'charging',bus_station:'bus',place_of_worship:'religion'};
 if(amenities[t.amenity])return amenities[t.amenity];
 if(t.shop==='supermarket')return'supermarket';if(t.shop==='convenience')return'convenience';if(t.shop&&t.shop!=='no')return'shopping';
 if(t.highway==='bus_stop'||t.public_transport==='platform'&&t.bus==='yes')return'bus';
 if(t.railway==='subway_entrance'||t.railway==='station'&&t.station==='subway')return'subway';
 if(t.tourism==='museum')return'museum';if(t.tourism==='attraction'||t.tourism==='viewpoint'||t.historic==='castle')return'attraction';if(t.leisure==='park')return'park';return null;
};
