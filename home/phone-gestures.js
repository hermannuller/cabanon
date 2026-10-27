'use strict';
// Distances are logical phone points, independent of device pixel density.
window.CabanonGestures=Object.freeze({move:8,page:16,holdSlop:10,axis(dx,dy,min=8){if(Math.hypot(dx,dy)+1e-7<min)return null;const x=Math.abs(dx),y=Math.abs(dy),tan=Math.tan(Math.PI/6);if(y<=x*tan+1e-7)return 'horizontal';if(x<=y*tan+1e-7)return 'vertical';return null;}});
