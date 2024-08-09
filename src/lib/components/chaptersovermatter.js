








// POKROVSK

console.log("flying to pokrovsk")
console.log(presetbounds.pokrovskBounds)

map.fitBounds(presetbounds.pokrovskBounds)
map.setLayoutProperty('Populated place', 'visibility', 'visible')
map.setLayoutProperty('control', 'visibility', 'visible')
map.setLayoutProperty('advances-layer', 'visibility', 'visible')


showTownLabels(map, ["Pokrovsk", "Kramatorsk", "Sloviansk", "Chasiv Yar", "Donetsk"])