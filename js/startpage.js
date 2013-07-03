/* startpage.js
 * This is custom js file for control function of the startpage
 * 
 * 
 * 
 * OpenLayers:
 * The Map is initialized and the Stations_Array is used to produce Vector 
 * Layers.
 * Improvements: Link in Popup relates the station to its name, better to use
 *                  its combined key: station_id, type_station
 * 
 * @author: Mirko Maelicke
 */
$(document).ready(function() {
    /*Use the slidebox for anouncements*/
/*    $('.bxslider').bxSlider({
        adaptiveHeight: true,
        mode: 'horizontal',
        slideMargin: 15,
        width: '600px'
    });
*/
    /* Use the slidebox for center ul*/
    $('#center_ul').bxSlider({
        adaptiveHeight: true,
        mode: 'horizontal',
        useCSS: false
    });

    /* Create slideToggle for admin-editing area  */
    $('#start_editing').click(function() {
        $('#edit_area').slideToggle('slow');
    });
    
    /* Create handle for advanced Filter area*/+
    $('#openAdvFilter').click(function(){
        if ($('#advFilter').css('display') == 'none'){
            $('.bx-viewport').css('height',parseInt($('.bx-viewport').css('height')) + parseInt($('#advFilter').css('height')));
            $('#advFilter').css('display', 'block');
            $('#openAdvFilter').html('close advanced Filter...');
        }
        else {
            $('#advFilter').slideToggle('slow');
            $('.bx-viewport').css('height',parseInt($('.bx-viewport').css('height')) - parseInt($('#advFilter').css('height')));
            $('#advFilter').css('display', 'none');
            $('#openAdvFilter').html('open advanced Filter...');
        } 
    });

    /* start the initialization function for the OpenLayers map*/
    init_map();
    
    /* hide search form on startpage */
    $('#top-search-form').css('display', 'none');

});

/* enabled tooltips */
$(function(){
    $(document).tooltip();
});


/* OpenLayers map settings */
var map, hydrostations, meteostations,view_hydro,view_meteo, selectControl, bounds, ask;
var nb1_wms, nb2_wms, district_wms;
var Meta = new Array();
function init_map() {
    //create map object
    /* Set the bounds of your geographical area, by
   specifying bottom-left (bl) and top right
   (tr) corners */
   bounds = new OpenLayers.Bounds();
        var bl_point = new OpenLayers.LonLat(3172900,-332400);
        var tr_point = new OpenLayers.LonLat(3477000,-70700);
 //       var bl_point = new OpenLayers.LonLat(19.3, 34.75);
 //       var tr_point = new OpenLayers.LonLat(29.65,41.8);
        bounds.extend(bl_point);
        bounds.extend(tr_point);

    //Define the MAP Options//
    var options = {
        'units' :   "m",
        'numZoomLevels' :   21,
        'sphericalMercator': true,
        'maxExtent': bounds,
        'projection'    :   new OpenLayers.Projection("EPSG:900913"),
        'displayProjection':    new OpenLayers.Projection("EPSG:4326")
        };
        
    map = new OpenLayers.Map('map', options);
    
    /* add base maps OSM and Google. TO use Googlestreetmaps, the API
     * has to be included in startpage.html from 
     * http://maps.google.com/maps/api/js?v=3&amp;sensor=false   */
    map.addLayer(new OpenLayers.Layer.OSM('Open Street Map'));
    map.addLayer(new OpenLayers.Layer.Google("Google Street Map", {visibility: false}));
    map.addLayer(new OpenLayers.Layer.Google( "Google Physical",{type: google.maps.MapTypeId.TERRAIN}));
    map.addLayer(new OpenLayers.Layer.Google( "Google Hybrid",{type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}));

    
    /* Set map Center and extend to show entire Rwanda */
    map.setCenter(new OpenLayers.LonLat(30.071100, -1.958018).transform(
            new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()), 8);
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.addControl(new OpenLayers.Control.OverviewMap());
//    map.addControl(new OpenLayers.Control.MousePosition());
    //map.addControl(new OpenLayers.Control.MousePosition());
    var AMousePosition = new OpenLayers.Control.MousePosition();
    map.addControl(AMousePosition);
    $("div.olControlMousePosition").css("bottom","5px");
    /* hide the default Zoom control and show a nice one 
     *  Just Hiding the object is not a good way, but works*/
    $('.olControlZoom').css('display', 'none');
    map.addControl(new OpenLayers.Control.PanZoomBar());
    
    /* do some styling*/
    $('.layersDiv').css('border-radius', '15px');
    $('.layersDiv').css('box-shadow','0px 0px 1.5em rgb(153,153,153)');
    $('.layersDiv').css('background-color','rgb(238,238,238)');
    $('.layersDiv').css('color','black');

    /*create the wms layers (nb123 etc...)*/
    nb1_wms = new OpenLayers.Layer.WMS("Catchment level 1 ows", "http://41.215.250.87:8080/geoserver/ows?",
            {   layers: 'nwrmp_wgs84tm:NB1_wgs84tm',styles: 'NB1',transparent: true,format: 'image/png'},
            {   isBaseLayer: false,opacity: 0.8,tiled: false}
          );
    nb2_wms = new OpenLayers.Layer.WMS("Catchment level 2", "http://41.215.250.87:8080/geoserver/wms?",
            {   layers: 'nwrmp_wgs84tm:NB2_wgs84tm',styles: 'NB2',transparent: true,format: 'image/png'},
            {   isBaseLayer: false,opacity: 0.8,tiled: false,visibility:false}
          );              
    district_wms = new OpenLayers.Layer.WMS("District", "http://41.215.250.87:8080/geoserver/wms?",
            {   layers: 'nwrmp_wgs84tm:District_wgs84tm',styles: 'District',transparent: true,format: 'image/png'},
            {   isBaseLayer: false,opacity: 0.8,tiled: false,visibility:false}
          );
    select = new OpenLayers.Layer.Vector("Selection", {styleMap: 
                new OpenLayers.Style(OpenLayers.Feature.Vector.style["select"])
            });
    map.addLayers([nb1_wms,nb2_wms,district_wms,select]);    

   //map.zoomToExtent(nb1_wms.getExtent());
    whereami = new OpenLayers.Layer.Vector('Where am I?', {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: 'images/marker.png',
            graphicWidth: 20, graphicHeight: 24, graphicYOffset: -24,
            pointRadius: 10
        })
    });
    map.addLayer(whereami);
    whereami.displayInLayerSwitcher = false;
    
    /*create Hydrostations layer*/
    hydrostations = new OpenLayers.Layer.Vector('Hydrological Stations', {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: 'images/marker_blue.png',
            graphicWidth: 20, graphicHeight: 24, graphicYOffset: -24,
            pointRadius: 10
            //title: '{$tooltip}'
        })
    });
    map.addLayer(hydrostations);
    fillLayer(hydrostations, Hydro_Stations_Array);
    view_hydro = Hydro_Stations_Array;
 
    /*create Meteostations layer*/
    meteostations = new OpenLayers.Layer.Vector('Meteorological Stations', {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: 'images/marker_red.png',
            graphicWidth: 20, graphicHeight: 24, graphicYOffset: -24,
            title: '{$tooltip}', pointRadius: 10
        })
    });
    map.addLayer(meteostations);
    fillLayer(meteostations, Meteo_Stations_Array);
    view_meteo = Meteo_Stations_Array;
    
    //event Listener
    selectControl = new OpenLayers.Control.SelectFeature([hydrostations, meteostations],{
        clickout: true,
        multiple: false,
        onSelect: showInfoBox,
        onUnselect: hideInfoBox
    });
    map.addControl(selectControl);
    selectControl.activate();
    
    //DEV
    var ANavToolBar = new OpenLayers.Control.NavToolbar();
    ANavToolBar.events.on({activate:function(){
            selectControl.deactivate();
            selectControl.activate();
    }});
    map.addControl(ANavToolBar);
    $("div.olControlNavToolbar").css("top","5px");
    $("div.olControlNavToolbar").css("left","40px");
    
}


function showInfoBox(feature) {
    selectedFeature = feature;
    //create a popup
    popup = new OpenLayers.Popup.FramedCloud('Info Box',
                feature.geometry.getBounds().getCenterLonLat(),
                null,
                "<div>Station Name: "+Meta[''+feature.id].name+"</div>"+
                "<p>Station ID: "+Meta[''+feature.id].id+"</p>"+
                "<a href='index.php?-table=stations&name_station="+Meta[''+feature.id].name+"&-action=browse'>"+
                "Jump to this Station</a>",
                null, true, closePopup);
    //color setting
    if(Meta[''+feature.id].ts == 'yes'){
        popup.backgroundColor = '#81F781';
    }
    else { popup.backgroundColor = '#FA5858'; }
    feature.popup = popup;
    map.addPopup(popup);
}

function closePopup(evt) {
    selectControl.unselect(selectedFeature);
}

function hideInfoBox(feature) {
    map.removePopup(feature.popup);
    feature.popup.destroy();
    feature.popup = null;
}


/** filters the entries of given EntryArray by the given mode and returns the
 *  result. The EntryArray is not Changed.
 *  
 *  @param {mode} 'ts' result Array will only contain Stations with timeseries
 *  @param {arg} argument the argument the filter will be applied to
 */
function filter(EntryArray, mode, arg){         //arg is optional
    var returnArray = new Array(), j = 0;
    if (mode == 'ts'){
        $.each(EntryArray, function(i, station){
            if (station.ts == "yes"){
                returnArray[j++] = station;
            }
        });
    }
    else if (mode == 'nb1'){
        $.each(EntryArray, function(i, station){
            if (station.nb1 == arg){
                returnArray[j++] = station;
            }
        });
    }
    else if (mode == 'riv'){
        $.each(EntryArray, function(i, station){
           if (station.riv == arg){
               returnArray[j++] = station;
           } 
        });
    }
    else if (mode == 'dis'){
        $.each(EntryArray, function(i, station){
            if (station.dis == arg){
                returnArray[j++] = station;
            }
        });
    }
    else if (mode == 'loc'){
        $.each(EntryArray, function (i, station){
            //get the distance
            //d = Math.sqrt(Math.pow((station.lon - ask.lon), 2) + 
            //        Math.pow((station.lat - ask.lat), 2));
            //new OpenLayers.Geometry.Point(lon,lat).transform(
            //    new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()

            d = OpenLayers.Util.distVincenty(station, ask);
            
            if(parseInt(d) <= parseInt(arg)){
                returnArray[j++] = station;
            }
        })
    }
    else { returnArray =  EntryArray;}

    return returnArray;

}

/** applies a Filter given as filterMode to EntryArray on all features of layer.
 *  refer to filer() to learn about all filterMode options
 * 
 * @see filter()
 * @see fillLayer()
 */
function applyFilter(layer, EntryArray, filterMode, arg){       //arg is optional
    /*clean the given layer*/
    layer.destroyFeatures();
    
    //filter the EntryArray
    newArray = filter(EntryArray, filterMode, arg);
    
    /*fill the layer again*/
    fillLayer(layer, newArray);
}

/** creates a OpenLayers Vector Feature on the given layer. EntryArray needs to 
 *  contain a JSON object including informations on name, lon, lat. The name is 
 *  passed to a Metadata Array
 * 
 */
function fillLayer(layer, EntryArray){
    $.each(EntryArray, function(i, object) {
        var objectLocation = new OpenLayers.Geometry.Point(parseFloat(object.lon),
                parseFloat(object.lat)).transform(new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject());
        
        feature = new OpenLayers.Feature.Vector(objectLocation);
        layer.addFeatures(feature);
        Meta[""+feature.id] = {'name': object.name,'ts':object.ts, 'id': object.id};

    });
    
}

/**
 * 
 */
function check_cbFilterTs(){
    cbState = document.getElementById('cbFilterTs').checked;
   if (cbState){
       applyFilter(meteostations, view_meteo, 'ts');
       applyFilter(hydrostations, view_hydro, 'ts');
       view_meteo = filter(view_meteo,'ts');
       view_hydro = filter(view_hydro, 'ts');
       $('#cb_label').html('reset all filters');
   }
   else {
       fillLayer(meteostations, Meteo_Stations_Array);
       fillLayer(hydrostations, Hydro_Stations_Array);
       view_hydro = Hydro_Stations_Array;
       view_meteo = Meteo_Stations_Array;
       $('#cb_label').html('hide stations without timeseries');
    }
}

/**
 * 
 
function applyAdvFilter(filterMode, index){
    applyFilter(meteostations, view_meteo, filterMode, index);
    applyFilter(hydrostations, view_hydro, filterMode, index);
    view_meteo = filter(view_meteo, filterMode, index);
    view_hydro = filter(view_hydro, filterMode, index);
}*/

function applyAdvFilter(filterMode, index){
    applyFilter(meteostations, Meteo_Stations_Array, filterMode, index);
    applyFilter(hydrostations, Hydro_Stations_Array, filterMode, index);
    view_meteo = filter(Meteo_Stations_Array, filterMode, index);
    view_hydro = filter(Hydro_Stations_Array, filterMode, index);
    
    cbState = document.getElementById('cbFilterTs').checked;
    if (cbState){
        applyFilter(meteostations, view_meteo, 'ts');
        applyFilter(hydrostations, view_hydro, 'ts');
    }
}


/**
 *
 */
function whereAmI(lon, lat){
    if (lon < 28.8 || lon > 30.9 || lat > -1.03 || lat < -2.84){
        alert ('The location '+lon+', '+lat+' is probably not within Rwanda.' );
    }
    
    whereami.destroyFeatures();
    askLocation = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(lon,lat).transform(
                new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()
            )
        );
    whereami.addFeatures(askLocation);
    ask = {'lon': lon, 'lat': lat};
    map.setCenter(new OpenLayers.LonLat(lon, lat).transform(
        new OpenLayers.Projection('EPSG:4326'), map.getProjectionObject()), 12);
}