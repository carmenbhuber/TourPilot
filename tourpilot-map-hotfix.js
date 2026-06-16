(function(){
  const floor8Map = {
    title: 'Karte 8. Stock',
    subtitle: 'Vereinfachte Übersicht für Station 14 und 15. Mit zwei Fingern zoomen und mit einem Finger verschieben.',
    html: '<img class="mapImage" src="assets/floor8-map.png?v=20260616-png3" alt="8. Stock mit Route und Stationen 14 und 15">'
  };

  if (typeof MAPS !== 'undefined') {
    MAPS.FLOOR8 = floor8Map;
  }

  getMap = function(floor, order) {
    const rawFloor = String(floor ?? '').trim().toUpperCase().replace(/\s+/g, '');
    const rawOrder = String(order ?? '').trim();
    const isFloor8 = rawFloor === '8' || rawFloor === '08' || rawFloor === '8.STOCK' || rawFloor === '8.OG' || rawFloor === 'OG8';
    const isStation14or15 = rawOrder === '14' || rawOrder === '15' || rawOrder === '';
    return isFloor8 && isStation14or15 ? floor8Map : null;
  };
})();
