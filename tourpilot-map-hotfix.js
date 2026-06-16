(function(){
  const floor8Map = {
    title: 'Karte 8. Stock',
    subtitle: 'Vereinfachte Übersicht für Station 14 und 15. Mit zwei Fingern zoomen und mit einem Finger verschieben.',
    html: '<img class="mapImage" src="assets/floor8-map.svg" alt="8. Stock mit Route und Stationen 14 und 15">'
  };

  window.getMap = getMap = function(floor) {
    const raw = String(floor ?? '').trim().toUpperCase().replace(/\s+/g, '');
    return (raw === '8' || raw === '08' || raw === '8.STOCK' || raw === '8.OG' || raw === 'OG8') ? floor8Map : null;
  };
})();
