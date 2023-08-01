import fs from 'fs'
const months = [ 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG',  'SEP', 'OCT', 'NOV', 'DEC' ]

const geojson = JSON.parse(fs.readFileSync('./scripts/ukraine_layers.geojson', 'utf8'))

const features = geojson.features.map(feature => {
  const splitName = feature.properties.layer.split('_')
  const layer = splitName[0]
  const date = splitName[1]
  const mon = layer === 'UkraineControlMap' ? date.slice(2, 5) : date.slice(0, 3)
  const month = String(months.indexOf(mon) + 1).padStart(2, '0')
  const year = date.slice(5)
  const day = layer === 'UkraineControlMap' ? date.slice(0, 2) : date.slice(3, 5)
  let parsedDate = `${day}-${month}-${year}`

  if (parsedDate === '07-06-2023') {
    parsedDate = '06-06-2023'
  }

  if (parsedDate === '31-05-2023') {
    parsedDate = '30-05-2023'
  }

  return {
    ...feature,
    properties: {
      date: parsedDate,
      layer
    }
  }
})

geojson.features = features

fs.writeFileSync('./scripts/ukraine_layers_parsed.geojson', JSON.stringify(geojson))



//UkraineControlMap_07JUN2023