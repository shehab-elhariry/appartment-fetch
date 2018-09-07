const rp = require('request-promise');
const cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var express= require('express');

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/data', (req, res) => res.sendFile(__dirname + '/data.json'))
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))
app.get('/fetch', (req, res) => { 

  var filteredlocations  = [];
  var s;
  if (req.query.pages) {
   var pages =  req.query.pages
  } else {
    pages = 5
  }
  for ( s = 0; s < pages; s++) {
  let options = {
    uri: `https://olx.com.eg/en/properties/properties-for-sale/alexandria/?search%5Bfilter_float_price%3Afrom%5D=400000&search%5Bfilter_float_price%3Ato%5D=500000&page=${s+1}`,
    transform: function (body) {
      return cheerio.load(body);
    }
  };

  rp(options)
    .then(($) => {
    var locations = [];
      $('.ads__item__location').each(function (i, elem) {
      locations.push({
         location: elem.children[0].data.replace(/\r?\n|\r|\t/g, ''),
         locationID: i,
         link: elem.parent.parent.children[0].next.attribs.href,
         title: elem.parent.parent.children[0].next.attribs.title,
         date: elem.prev.prev.children[0].data.replace(/\r?\n|\r|\t/g, ''),
         image: elem.parent.parent.prev.prev.children[1].attribs.src });
      })

      var filteredPageLocations = locations.filter(function (i, e) { 
      return i.location !== 'Nakheel' &&  i.location !== 'Miami' && i.location !== 'Maamoura' && i.location !== 'Maamoura' && i.location !== 'Sidi Beshr' && i.location !== 'Agami' && i.location !== 'Seyouf' && i.location !== 'Wardian' && i.location !== 'Borg al-Arab' && i.location !== 'Bahray - Anfoshy' && i.location !== 'Bahray - Anfoshy' && i.location !== 'Tosson' && i.location !== 'Asafra' && i.location !== 'Mandara' && i.location !== 'Bacchus' && i.location !== 'Gomrok' && i.location !== 'Awayed' && i.location !== 'Abu Qir' && i.location !== 'Labban' && i.location !== 'Al Hadrah' && i.location !== 'Amreya'  ;
      })

      filteredlocations.push(filteredPageLocations)
      
    })
    .catch((err) => {
      console.log(err);
    });
  }

  var file = 'data.json'

  setTimeout(function () {
  jsonfile.writeFile(file, {data: filteredlocations}, function (err) {
    console.error(err)
  })

  return res.send('fetched')

  }, parseInt(5000 + (pages * 1200)))
 
  
})

const PORT = process.env.PORT
app.listen(PORT)

//local
// app.listen(3000, () => console.log('Example app listening on port 3000!'))