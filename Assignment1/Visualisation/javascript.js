// BRONNEN

// Data:
// http://www.quantware.ups-tlse.fr/QWLIB/topwikipeople/
// http://www.quantware.ups-tlse.fr/QWLIB/topwikipeople/tables/ListOfPageRankGlobalHFs.txt
// https://www.cnet.com/news/the-most-influential-person-in-history-according-to-wikipedia/
// https://www.alletop10lijstjes.nl/top-10-belangrijkste-personen-uit-de-geschiedenis-volgens-wikipedia/
// https://gist.github.com/sindresorhus/1341699

// Code:
// https://stackoverflow.com/questions/26811347/mouse-wheel-zoom-map-datamaps-js
// https://www.w3schools.com/howto/howto_js_rangeslider.asp


const dataList = {};
let map;

$(document).ready(function(){

  map = new Datamap({
      element: document.getElementById('container'),
      scope: 'world',
      done: function(datamap){ 
        datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));
        function redraw() {
          
          datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
          
          // Change century label (above slider)
          updateCenturyLabel(slider.value);
          
          // Show right data for this century on map
          addBubbles(getCenturyList(slider.value < 1? slider.value - 1 : slider.value));
          // - 1 when it's a negative century, because value 0 of slider doesn't compare to a century, and so it doesn't count
        
        }
      },
      projection: 'mercator',
      geographyConfig: {
          popupOnHover: false,
          highlightOnHover: false,
          borderColor: '#66B26B',
      },
      bubblesConfig: {
        fillOpacity: 0.3,
        borderWidth: 0.8,
        borderColor: '#000',
        popupOnHover: true,
        animate: true,
        highlightOnHover: true,
        highlightFillColor: 'black',
        highlightBorderColor: 'black'
      },
      fills: {
        'bubble': '#000000',
        defaultFill: '99E59E'
      },
      data: {
          'bubble': {fillKey: 'bubble'}
      },

  });

  prepareData();

  const slider = document.getElementById("century_slider");
  slider.oninput = function() {
    updateCenturyLabel(slider.value);
    addBubbles(getCenturyList(slider.value < 1? slider.value - 1 : slider.value));
    // - 1 when it's a negative century, because value 0 of slider doesn't compare to a century, and so it doesn't count
  }
});

function updateCenturyLabel(value) {
  let label = " A.D.";
  let newValue = " CENTURY";
  let absoluteValue = Math.abs(value);

  if (value < 1) {
    label = " B.C.";
    absoluteValue++;
  }

  let prefix = absoluteValue;

  switch (absoluteValue) {
    case 1:
      prefix += "ST";
      break;
    case 2:
      prefix += "ND";
      break;
    case 3:
      prefix += "RD";
      break;
    default:
      prefix += "TH";
      break;
  }

  newValue = prefix + newValue + label;

  $(".century_label").html(newValue);
}

function prepareData(){
  // Check for lowest and highest century in dataset so slider can have the right values
  var lowest = 0;
  var highest = 0;

  // Merge both datasets (people & country codes with long+lat info) to a new list
  $.getJSON("list.json", function(list){
    $.getJSON("countries.json", function(countries){

      for(var i = 0; i < list.length; i++){

        var item = list[i];
        var century = parseInt(item.century);
        var country_code = item.country_code.toLowerCase();


        var exists = false;
        var index = 0;

        if(dataList[century] == null){
          //console.log("century doesn't exist yet");
          dataList[century] = [];
        } else {
          //console.log("century already exists");

          for(var j = 0; j < dataList[century].length; j++){
            var countryItem = dataList[century][j];
            if(countryItem.country_code == country_code){
              exists = true;
              index = j;
            }
          }
        }


        if(!exists){
          //console.log("country doesn't exist yet");
          dataList[century].push({
            country_code: country_code,
            people: [item],
            latitude: countries[country_code][0],
            longitude: countries[country_code][1],
            radius: 2,
            fillKey: 'bubble'
          });
        } else {
          //console.log("country already exists");
          dataList[century][index]['people'].push(item);
          dataList[century][index]['radius'] += 1;
          // Radius determines the size of a databubble on the map. The more people in this country in this century --> the bigger the bubble
        }


        if(century < lowest){
          lowest = century;
        } else if(century > highest){
          highest = century;
        }
      }

      // Set the slider to the right values
      $("#century_slider").attr('min', lowest + 1);
      // + 1 because value 0 of slider doesn't compare with a century, and so it doesn't count
      $("#century_slider").attr('max', highest);
      $("#century_slider").attr('value', lowest+1);
      
      // Start with lowest century
      updateCenturyLabel(lowest+1);
      addBubbles(getCenturyList(lowest));

    });
  });
}

function getCenturyList(century){
  return dataList[century];
}

function addBubbles(list){ // Add databubbles to map

    map.bubbles((list? list: []), {
      popupTemplate: function (geo, data) {
        showPeopleList(data);
        return ""; // Data gets shown elsewhere instead of in the standard hover textbox, so return nothing
          /*return ['<div class="hoverinfo">' +  data.name,
          '<br/>Payload: ' +  data.yield + ' kilotons',
          '<br/>Country: ' +  data.country + '',
          '<br/>Date: ' +  data.date + '',
          '</div>'].join('');*/
      }
    });

}

function showPeopleList(data) { // Show peopledata to the left of the map
  let html = '<div class="info">';
  data['people'].forEach((person) => {
    html += '<span>' + person.name + '</span>';
  });
  html += '</div>';
  $("#people-list").html(html);
}
