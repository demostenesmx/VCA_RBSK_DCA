//=====================Datos de entrada para el estudio del ecosistema de duna costera (DC) y variabilidad climatica     ===========================================/
//=====================en un periodo de 10 años dentro de la Reserva de la Biosfera de Sian Ka´an (RBSK), Quintana Roo, México.====================================/
//=====================(Elaboración y modificación estructural de codigos por MMZC. Eloy Gayosso Soto).===========================================================/

//================================1.Capas de estudio de entrada.====================================/

var ZN =ee.FeatureCollection ('users/veronica78mere/ZN');
var ZS = ee.FeatureCollection ('users/veronica78mere/ZS');

//===============================1.1. Fusión capas vectoriales de área de estudio.=====================/

var zonas =ee.FeatureCollection (ZN.merge(ZS));

//====================================1.2. Fecha de estudio total.============================/
var StartYear = 2011, EndYear = 2020;

//=====================================1.3. Lista de meses.
var months = ee.List.sequence(1,12);
 
//====================================1.4.Estableciendo el inicio y fin del estudio
var startdate = ee.Date.fromYMD(StartYear,1,1);
var enddate = ee.Date.fromYMD(EndYear,12,31);

 // ===================================1.5. Lista de años variables 
var years = ee.List.sequence(StartYear,EndYear);

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------/
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------/
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------/
//----------------------------------Precipitación (mm)-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------/
//=========================2. Variables Climaticas Ambientales Obtenidas del Catalogo de TERRACLIMATE código de Carmona-Arteaga (2020) modificado y adaptado para el presnete estudio==============/

//=========================2.1.Colección de entrada de precipitacion y temperatura máxima para superficies terrestres globales, de la documentación  GEE (TerraClimate por Abatzoglou et al., (2018): https://www.nature.com/articles/sdata2017191#Tab2.===========/

//2.1.2.==============================================================/
var clima = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
                  .select('pr','tmmx','tmmn')
                  .filterDate (startdate, enddate)
                  .filterBounds(zonas);
//2.1.3.==============================================================/
           
     var Tempscala = clima.map(function(image) {
     return image.select('tmmx','tmmn').multiply(0.1).set(
      'system:time_start', image.get('system:time_start'));
});
             
//==========================3.Seleccion de variables climaticas dentro de la RBSK.===========================================================/

var TemperaturaMaxima = Tempscala.select('tmmx').median().clip(zonas);//.set('system:time_start', Temp.get('system:time_start'));
var TemperaturaMinima = Tempscala.select('tmmn').median().clip(zonas);//.set('system:time_start', clima.get('system:time_start'));
var PrecipitacionAcumulada = clima.select('pr').median().clip(zonas);//.set('system:time_start', clima.get('system:time_start'));

//===========================4. Cálculo Anual de Precipitación===============================================================================/
var Precipitacion_anual_acum = ee.ImageCollection.fromImages(
  years.map(function (year) {
    var annual = clima.filter(ee.Filter.calendarRange(year, year, 'year'))
        .sum()
        .clip(zonas);
    return annual
        .set('year', year)
        .set('system:time_start', ee.Date.fromYMD(year, 1, 1));
}));
//==================================4.1.Gráfico de precipitación anual===============================================/

var chartP_anual = ui.Chart.image.seriesByRegion({
    imageCollection: Precipitacion_anual_acum,
    regions: zonas, 
    reducer: ee.Reducer.median(), 
    band: 'pr', 
    scale: 2500, 
    xProperty: 'system:time_start', 
    seriesProperty: 'Nombre'})
    .setOptions({
      title: 'Precipitación anual acumulada por áreas de estudio',
      hAxis: {title: 'Intervalo de tiempo'},
      vAxis: {title: 'P (mm)'},
      titleTextStyle: {italic: false, bold: true,  center: true}}
      )
    .setChartType('ColumnChart'); 
    
//========================4.2.Imprimir gráfico anual===================================================================================/
//print(chartP_anual);

//=========================4.3. Parametros de visualización.==============================================================================/
var VisAnual = {opacity:1,
            bands:['pr'],
            min:954.00,
            max:2038.00,
            palette:['cyan','darkblue','orange','Magenta','DarkMagenta','DeepPink']};

//========================================5.Calculo mensual de precipitación.==================================/

var Precipitacion_mensual_acum =  ee.ImageCollection.fromImages(  // Devuelve la Imagen para Colección.
  years.map(function (año) { // Se aplica la funbcion Map (LOOP) a la variable años
  
  return months.map(function(mes){ // devuelve la variable meses con la siguiente función clima:  
  
  var pre_month = clima.filter(ee.Filter.calendarRange(año, año, 'year'))  //filtro por año,
           .filter(ee.Filter.calendarRange(mes, mes, 'month')) //  filtro por mes
           .sum() //Sum- Agrega todos los valores de colección del mes.
           .clip(zonas);
  
  return pre_month.set('year', año) // Rango de años = Y
           .set('month', mes) // Rango de mes = m
           .set('date', ee.Date.fromYMD(año,mes,1)) // Fecha: Es la fecha que viene del año, mes y día 1.
           .set('system:time_start',ee.Date.fromYMD(año,mes,1)); // Rango de colecciones Time_Start del sistema.
            }); 
          }).flatten()
          ); /// Colecciones apiladas

//==============================5.1.Gráfico de precipitación mensual.============================================================/
var chartMensual = ui.Chart.image.seriesByRegion({
    imageCollection: Precipitacion_mensual_acum,
    regions: zonas, 
    reducer: ee.Reducer.median(), 
    band: 'pr', 
    scale: 2500, 
    xProperty: 'system:time_start', 
    seriesProperty: 'Nombre'})
    .setOptions({
      position: 'center',
      title: 'Precipitación mensual acumulada del área de estudio usando TERRACLIMATE',
      hAxis: {title: 'Intervalo de tiempo'},
      vAxis: {title: 'P (mm)'},
      titleTextStyle: {italic: false, bold: true,  center: true}}
      )
    .setChartType('ColumnChart');  
//'LineChart', 'ColumnChart'

//===============================5.2.Imprimir gráfico anual======================================================/
print(chartMensual);

//=================================5.3. Parametros de visualización.==================================================/
var Vis = {opacity:1,
            bands:['pr'],
            min:60.00,
            max:165.00,
            palette:['red','orange','yellow','green','cyan','blue','darkblue']};

//--------------------------------------------------------------------------------------------------------------------------------/
//------------------------------------Temperatura Máxima (°C)--------------------------------------------------------------------/
//------------------------------------------------------------------------------------------------------------------------------/

//================================6. Función para el cálculo  de la temperatura anual máxima y mínima.===============================================================================/
var Temperatura_anual_acum = ee.ImageCollection.fromImages(
  years.map(function (year) {
    var annual = Tempscala.filter(ee.Filter.calendarRange(year, year, 'year'))
        .sum()
        .clip(zonas);
    return annual
        .set('year', year)
        .set('system:time_start', ee.Date.fromYMD(year, 1, 1));
}));

//========================================7.Función parea el cálculo de la temperatura mensual máxima y mínima.==================================/

var Temperatura_mensual_acum =  ee.ImageCollection.fromImages(  // Devuelve la Imagen para Colección.
  years.map(function (año) { // Se aplica la funbcion Map (LOOP) a la variable años
  
  return months.map(function(mes){ // devuelve la variable meses con la siguiente función clima:  
  
  var pre_month = Tempscala.filter(ee.Filter.calendarRange(año, año, 'year'))  //filtro por año,
           .filter(ee.Filter.calendarRange(mes, mes, 'month')) //  filtro por mes
           .sum() //Sum- Agrega todos los valores de colección del mes.
           .clip(zonas);
  
  return pre_month.set('year', año) // Rango de años = Y
           .set('month', mes) // Rango de mes = m
           .set('date', ee.Date.fromYMD(año,mes,1)) // Fecha: Es la fecha que viene del año, mes y día 1.
           .set('system:time_start',ee.Date.fromYMD(año,mes,1)); // Rango de colecciones Time_Start del sistema.
            }); 
          }).flatten()
          ); /// Colecciones apiladas

//==================================8.Gráfico de temperatura anual máxima. ===============================================/

var chartT01_anual= ui.Chart.image.seriesByRegion({
    imageCollection: Temperatura_anual_acum,
    regions: zonas, 
    reducer: ee.Reducer.median(), 
    band: 'tmmx', 
    scale: 50, 
    xProperty: 'system:time_start', 
    seriesProperty: 'Nombre'})
    .setOptions({
      title: 'Temperatura máxima anual acumulada por áreas de estudio',
      hAxis: {title: 'Intervalo de tiempo'},
      vAxis: {title: 'T (°C)'},
      titleTextStyle: {italic: false, bold: true,  center: true}}
      )
    .setChartType('ColumnChart'); 
    
//================================8.1.Imprimir gráfico anual===================================================================================/
//print(chartT01_anual);

//=================================8.2. Parametros de visualización.==============================================================================/
var VisAnual02 = {opacity:1,
            bands:['tmmx'],
            min:0,
            max:50,
            palette:['cyan','darkblue','orange','Magenta','DarkMagenta','DeepPink']};


//================================9.Gráfico de la temperatura máxima mensual.============================================================/
var chartMensual02= ui.Chart.image.seriesByRegion({
    imageCollection: Temperatura_mensual_acum,
    regions: zonas, 
    reducer: ee.Reducer.median(), 
    band: 'tmmx', 
    scale: 50, 
    xProperty: 'system:time_start', 
    seriesProperty: 'Nombre'})
    .setOptions({
      position: 'center',
      title: 'Temperatura máxima mensual acumulada en el área de estudio usando TERRACLIMATE',
      hAxis: {title: 'Intervalo de tiempo'},
      vAxis: {title: 'T (°C)'},
      titleTextStyle: {italic: false, bold: true,  center: true}}
      )
    .setChartType('ColumnChart');  
//'LineChart', 'ColumnChart'

//==================================9.1.Imprimir gráfico anual======================================================/
print(chartMensual02);

//==================================9.2. Parametros de visualización.==================================================/
var Vis02 = {opacity:1,
            bands:['tmmx'],
            min:0,
            max:100,
            palette:['red','orange','yellow','cyan','magenta','darkmagenta']};

//--------------------------------------------------------------------------------------------------------------------------------/
//------------------------------------Temperatura Mínima (°C)--------------------------------------------------------------------/
//------------------------------------------------------------------------------------------------------------------------------/

//==================================10.Gráfico de temperatura anual mínima.===============================================/

var chartT02_anual= ui.Chart.image.seriesByRegion({
    imageCollection: Temperatura_anual_acum,
    regions: zonas, 
    reducer: ee.Reducer.median(), 
    band: 'tmmn', 
    scale: 50, 
    xProperty: 'system:time_start', 
    seriesProperty: 'Nombre'})
    .setOptions({
      title: 'Temperatura anual mínima acumulada por áreas de estudio',
      hAxis: {title: 'Intervalo de tiempo'},
      vAxis: {title: 'T (°C)'},
      titleTextStyle: {italic: false, bold: true,  center: true}}
      )
    .setChartType('ColumnChart'); 
    
//================================10.1.Imprimir gráfico anual===================================================================================/
//print(chartT02_anual);

//=================================10.2. Parametros de visualización.==============================================================================/
var VisAnual03 = {opacity:1,
            bands:['tmmn'],
            min:0,
            max:50,
            palette:['cyan','darkblue','orange','Magenta','DarkMagenta','DeepPink']};


//================================11.Gráfico de la temperatura mensual mínima.============================================================/
var chartMensual03= ui.Chart.image.seriesByRegion({
    imageCollection: Temperatura_mensual_acum,
    regions: zonas, 
    reducer: ee.Reducer.median(), 
    band: 'tmmn', 
    scale: 50, 
    xProperty: 'system:time_start', 
    seriesProperty: 'Nombre'})
    .setOptions({
      position: 'center',
      title: 'Temperatura mensual mínima acumulada en el área de estudio usando TERRACLIMATE',
      hAxis: {title: 'Intervalo de tiempo'},
      vAxis: {title: 'T (°C)'},
      titleTextStyle: {italic: false, bold: true,  center: true}}
      )
    .setChartType('ColumnChart');  
//'LineChart', 'ColumnChart'

//==================================11.1.Imprimir gráfico anual======================================================/
print(chartMensual03);

//==================================11.2. Parametros de visualización.==================================================/
var Vis03 = {opacity:1,
            bands:['tmmn'],
            min:0,
            max:100,
            palette:['red','orange','yellow','cyan','magenta','darkmagenta']};

//==================================12.Exportar variables ambientales.======================================================/

Export.image.toDrive({image: TemperaturaMaxima, 
description: 'TemperaturaMaxima', 
scale: 30 ,
folder: 'GEE',
crs: 'EPSG:32616', 
region: zonas});

Export.image.toDrive({image: TemperaturaMinima, 
description: 'TemperaturaMinima', 
scale: 300 , folder: 'GEE',
crs: 'EPSG:32616', 
region: zonas});

Export.image.toDrive({image: PrecipitacionAcumulada, 
description: 'PrecipitacionAcumulada', 
crs: 'EPSG:32616', 
scale: 30,
folder: 'GEE', region: zonas});

//===================================13. Agregar la capa de variables ambientales al mapa.================================================================================/

//Map.addLayer(Temperatura_anual_acum, VisAnual02, 'Temperatura Anual Máxima',1);
Map.addLayer(Temperatura_mensual_acum , Vis02, 'Temperatura Mensual Máxima',1);

//Map.addLayer(Temperatura_anual_acum, VisAnual03, 'Temperatura Anual Mínima',1);
Map.addLayer(Temperatura_mensual_acum , Vis03, 'Temperatura Mensual Mínima',1);

//Map.addLayer(Precipitacion_anual_acum, VisAnual, 'Precipitación Anual',1);
Map.addLayer(Precipitacion_mensual_acum, Vis, 'Precipitación Mensual',1);

//---------------------------------------------------------------------------------------------------------------------------------------------------------/
//--------------------------------------------------------------------------------------------------------------------------------------------------------/
//--------------------------------------------------14.Carga del Modelo Diggital de Elavación a 30m de resolución de la NASA SRTM------------------------/

var dem = ee.Image("USGS/SRTMGL1_003");

//===========================================14.1.Obtener pendiente para las zonas de estudio.===========================================================/
//===========================(la tasa máxima de cambio de valor del DEM de un pixel con respecto a sus vecinos).========================================/
var pendiente =  ee.Terrain.slope(dem).clip(zonas); 

//==================================14.2.Imprimiendo valores máximos y mínimos por zona de estudio.=======================================================================/

//1.======================================================/
print ('Pendiente Min_Max_ZN', dem.reduceRegion({
  reducer: ee.Reducer.minMax(), // En metros
  geometry: ZN
}));

//2.======================================================================================/
print('Pendiente Min_Max_ZS', dem.reduceRegion({
  reducer: ee.Reducer.minMax(), //En metros
  geometry: ZS
}));

//========================================15. Exportando Imagen de pendiente por zona de estudio.======================================================/

//======================================1.ZN.==================================================/
 Export.image.toDrive({  image: pendiente,
  description: 'Pendiente',
  folder: "GEE",
  scale: 30,
  crs: 'EPSG:32616',
  region: zonas});

///=======================================2.ZS.================================================/
//  Export.image.toDrive({
// image: pendiente,
// description: 'Pendiente_ZS',
// folder: "GEE",
// scale: 30,
// region: ZS});

//====================================16. Añadir pendiente al mapa.======================/
Map.addLayer(pendiente, {
  min: 0,
  max: 90,
  palette: [
    '3ae237', 'b5e22e', 'd6e21f', 'fff705', 'ffd611', 'ffb613', 'ff8b13',
    'ff6e08', 'ff500d', 'ff0000', 'de0101', 'c21301', '0602ff', '235cb1',
    '307ef3', '269db1', '30c8e2', '32d3ef', '3be285', '3ff38f', '86e26f'
  ]},'Pendiente_Zonas'); 

//====================================17.Añadir al mapa el promedio de la mediana de la imagen y perimetro del área de estudio.==========================/

Map.addLayer (Sian_Per,{color:'red'}, 'RBSK');
Map.addLayer (ZN, {color:'blue'}, 'ZN');
Map.addLayer (ZS, {color:'cyan'}, 'ZS');

//======================================18.Centrar el mapa en el archivo vectorial de la RBSK (Perimetro).==================================================/
Map.centerObject (Sian_Per, 10);
