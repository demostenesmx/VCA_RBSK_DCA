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

//function median(image) {
//    var medianbands = image.reduce(ee.Reducer.median());
//  return image.addBands(medianbands);
//}
//===========================================14.1.Obtener pendiente para las zonas de estudio.===========================================================/
//===========================(la tasa máxima de cambio de valor del DEM de un pixel con respecto a sus vecinos).========================================/

  var pendiente =  ee.Terrain.slope(dem).clip(zonas);//.map(median); 

//==================================14.2.Imprimiendo estadísticos por zona de estudio.=======================================================================/

//1.======================================================/
var reducerp01 = ee.Reducer.mean();
var reducersp01 = reducerp01.combine({reducer2: ee.Reducer.median(), sharedInputs: true})
                       .combine({reducer2: ee.Reducer.stdDev(), sharedInputs: true})
                       .combine({reducer2: ee.Reducer.variance(), sharedInputs: true})
                       .combine({reducer2: ee.Reducer.max(), sharedInputs: true})
                       .combine({reducer2: ee.Reducer.min(), sharedInputs: true});

var resultsp01 =dem.select('elevation').reduceRegion({reducer: reducersp01,
                                geometry: ZN,
                                scale: 30,
                                bestEffort: true});
//Imprimir en consola.
print ('Estadisticos_elevación_ZN', resultsp01);

//2.======================================================================================/
var reducerp02 = ee.Reducer.mean();
var reducersp02 = reducerp02.combine({reducer2: ee.Reducer.median(), sharedInputs: true})
                       .combine({reducer2: ee.Reducer.stdDev(), sharedInputs: true})
                       .combine({reducer2: ee.Reducer.variance(), sharedInputs: true})
                       .combine({reducer2: ee.Reducer.max(), sharedInputs: true})
                       .combine({reducer2: ee.Reducer.min(), sharedInputs: true});

var resultsp02 =dem.select('elevation').reduceRegion({reducer: reducersp02,
                                geometry: ZS,
                                scale: 30,
                                bestEffort: true});
//Imprimir en consola.
print ('Estadisticos_elevación_ZS', resultsp02);

//==================================14.3 Generando perfil de elevación ZN y ZS, distribuyendo los puntos sobre la=======================================/
//=======================================duna costera dentro de la RBSK.============================================/

//1.========================================ZN.==========================================================/
//Distribución al azar de los puntos de referencia para generar el perfil.

var waypoints = [
ee.Feature(ee.Geometry.Point([-87.46949957357543,19.780954814410016]), {'name': 'ZN_01'}),
ee.Feature( ee.Geometry.Point([-87.46931181894439,19.78159589407046]), {'name': 'ZN_02'}),
ee.Feature(ee.Geometry.Point([-87.46920698583735,19.78200351998626]), {'name': 'ZN_03'}),
ee.Feature(ee.Geometry.Point([-87.46889584959162,19.782515875761636]), {'name': 'ZN_04'}),
ee.Feature(ee.Geometry.Point([-87.46866741226594,19.782835576899508]), {'name': 'ZN_05'}),
ee.Feature(ee.Geometry.Point([-87.4685333018152,19.783284832415344]), {'name': 'ZN_06'}),
ee.Feature(ee.Geometry.Point([-87.46857085274141,19.78375427783658]), {'name': 'ZN_07'}),
ee.Feature(ee.Geometry.Point([-87.46889789366114,19.784184507002244]), {'name': 'ZN_08'}),
ee.Feature(ee.Geometry.Point([-87.46922512316095,19.785007292879538]), {'name': 'ZN_09'}),
ee.Feature(ee.Geometry.Point([-87.46957341615632,19.785877945302744]), {'name': 'ZN_10'}),
ee.Feature(ee.Geometry.Point([-87.47014204446748,19.786589673006212]), {'name': 'ZN_11'}),
ee.Feature(ee.Geometry.Point([-87.47079064324286,19.78855435209843]), {'name': 'ZN_12'}),
ee.Feature(ee.Geometry.Point([-87.47105365738383,19.78917565573007]), {'name': 'ZN_13'}),
ee.Feature(ee.Geometry.Point([-87.47166520103923,19.78972079786106]), {'name': 'ZN_14'}),
ee.Feature(ee.Geometry.Point([-87.47194415077678,19.790361024837885]), {'name': 'ZN_15'}),
ee.Feature(ee.Geometry.Point([-87.47205143913737,19.790951590999192]), {'name': 'ZN_16'}),
ee.Feature(ee.Geometry.Point([-87.47241332192563,19.79158038912391]), {'name': 'ZN_17'}),
ee.Feature(ee.Geometry.Point([-87.4726950114535,19.792649901797205]), {'name': 'ZN_18'}),
ee.Feature(ee.Geometry.Point([-87.47292157536945,19.79362962015328]), {'name': 'ZN_19'}),
ee.Feature(ee.Geometry.Point([-87.47315224534474,19.794548258820193]), {'name': 'ZN_20'}),
ee.Feature(ee.Geometry.Point([-87.47325734762921,19.795219553796304]), {'name': 'ZN_21'}),
ee.Feature(ee.Geometry.Point([-87.47332441143878,19.796019523569694]), {'name': 'ZS_22'}),
ee.Feature(ee.Geometry.Point([-87.47357117466815,19.796736253322575]), {'name': 'ZS_23'}),
ee.Feature(ee.Geometry.Point([-87.47400039020098,19.797301851123716]), {'name': 'ZS_24'}),
ee.Feature(ee.Geometry.Point([-87.47698837104357,19.804085362863884]), {'name': 'ZS_25'}),
ee.Feature(ee.Geometry.Point([-87.47706918984004,19.80648076623233]), {'name': 'ZS_26'}),
ee.Feature(ee.Geometry.Point([-87.47716308467895,19.808160112936473]), {'name': 'ZS_27'}),
ee.Feature(ee.Geometry.Point([-87.4765408121875,19.81082491660056]), {'name': 'ZS_28'}),
ee.Feature(ee.Geometry.Point([-87.47570037077038,19.81301083986533]), {'name': 'ZS_29'}),
ee.Feature(ee.Geometry.Point([-87.47456311414807,19.8159581817079]), {'name': 'ZS_30'}),
ee.Feature(ee.Geometry.Point([-87.47437849296149,19.81757094667874]), {'name': 'ZS_31'}),
ee.Feature(ee.Geometry.Point([-87.47343435538825,19.81922626230744]), {'name': 'ZS_32'}),
ee.Feature(ee.Geometry.Point([-87.47255459083136,19.820639322988097]), {'name': 'ZS_33'}),
ee.Feature(ee.Geometry.Point([-87.47173919929084,19.82257721435329]), {'name': 'ZS_34'}),
ee.Feature(ee.Geometry.Point([-87.47068976397608,19.82429116329643]), {'name': 'ZS_35'}),
ee.Feature(ee.Geometry.Point([-87.469595422698,19.82647123933098]), {'name':'ZS_36'}),
ee.Feature(ee.Geometry.Point([-87.46814091194413,19.828017073985805]), {'name':'ZS_37'}),
ee.Feature(ee.Geometry.Point([-87.46670441544259,19.82940877283078]), {'name':'ZS_38'}),
ee.Feature(ee.Geometry.Point([-87.46507363236154,19.830478594241626]), {'name': 'ZS_39'}),
ee.Feature(ee.Geometry.Point([-87.46329264557565,19.83148785312002]), {'name': 'ZS_40'}),
ee.Feature(ee.Geometry.Point([-87.46106104767526,19.832820065022236]), {'name': 'ZS_41'}),
ee.Feature(ee.Geometry.Point([-87.45902256882394,19.833506351642146]), {'name': 'ZS_42'}),
ee.Feature(ee.Geometry.Point([-87.45760636246408,19.833667830415955]), {'name': 'ZS_43'}),
ee.Feature(ee.Geometry.Point([-87.45664076721872,19.833607275895016]), {'name': 'ZS_44'}),
ee.Feature(ee.Geometry.Point([-87.45557861244882,19.833395334889943]), {'name': 'ZS_45'}),
ee.Feature(ee.Geometry.Point([-87.45450036442483,19.83356690620157]), {'name': 'ZS_46'}),
ee.Feature(ee.Geometry.Point([-87.45333884082969,19.833997549833548]), {'name': 'ZS_47'}),
ee.Feature(ee.Geometry.Point([-87.45241616092856,19.83437096809417]), {'name': 'ZS_48'}),
ee.Feature(ee.Geometry.Point([-87.45165368253345,19.835195951615695]), {'name': 'ZS_49'}),
ee.Feature(ee.Geometry.Point([-87.45102661317867,19.83586676922528]), {'name': 'ZS_50'}),
ee.Feature(ee.Geometry.Point([-87.45065953053914,19.836852594477485]), {'name': 'ZS_51'}),
ee.Feature(ee.Geometry.Point([-87.44976109308155,19.83797744864659]), {'name': 'ZS_52'}),
ee.Feature(ee.Geometry.Point([-87.44911601790142,19.83862250601939]), {'name': 'ZS_53'}),
ee.Feature(ee.Geometry.Point([-87.44860575136985,19.839322982417382]), {'name': 'ZS_54'}),
ee.Feature(ee.Geometry.Point([-87.44839841545597,19.840610435394026]), {'name': 'ZS_55'}),
ee.Feature(ee.Geometry.Point([-87.44807683908154,19.841624275814123]), {'name': 'ZS_56'}),
ee.Feature(ee.Geometry.Point([-87.44762180502822,19.84233486847714]), {'name': 'ZS_57'}),
ee.Feature(ee.Geometry.Point([-87.44685376375928,19.84340408659372]), {'name': 'ZS_58'}),
ee.Feature(ee.Geometry.Point([-87.44649826853528,19.844463722006118]), {'name': 'ZS_59'}),
ee.Feature(ee.Geometry.Point([-87.44638143898285,19.845217788498925]), {'name': 'ZS_60'}),
ee.Feature(ee.Geometry.Point([-87.44607030273713,19.84644896919954]), {'name': 'ZS_61'}),
ee.Feature(ee.Geometry.Point([-87.44578487895723,19.84734241939724]), {'name': 'ZS_62'}),
ee.Feature(ee.Geometry.Point([-87.44552002273879,19.848874356814978]), {'name': 'ZS_63'}),
ee.Feature(ee.Geometry.Point([-87.44520420567824,19.85026276475958]), {'name': 'ZS_64'}),
ee.Feature(ee.Geometry.Point([-87.44498672853433,19.85106593364226]), {'name': 'ZS_65'}),
ee.Feature(ee.Geometry.Point([-87.44469580556974,19.852341486173856]), {'name': 'ZS_66'}),
ee.Feature(ee.Geometry.Point([-87.44406859277758,19.853935146624714]), {'name': 'ZS_67'}),
ee.Feature(ee.Geometry.Point([-87.44283706458884,19.85603590536463]), {'name': 'ZS_68'}),
ee.Feature(ee.Geometry.Point([-87.44093133762935,19.858206306593654]), {'name': 'ZS_69'}),
ee.Feature(ee.Geometry.Point([-87.43964441030141,19.85952770222183]), {'name': 'ZS_70'}),
ee.Feature(ee.Geometry.Point([-87.4389577647936,19.86150548164287]), {'name': 'ZS_71'}),
ee.Feature(ee.Geometry.Point([-87.43805958400647,19.86328188036608]), {'name': 'ZS_72'}),
ee.Feature(ee.Geometry.Point([-87.43656827579419,19.864704639476127]), {'name': 'ZS_73'}),
ee.Feature(ee.Geometry.Point([-87.43592585893731,19.865317125873588]), {'name': 'ZS_74'}),
ee.Feature(ee.Geometry.Point([-87.43673052164178,19.867572355351342]), {'name': 'ZS_75'}),
ee.Feature(ee.Geometry.Point([-87.4370083974369,19.869354281694108]), {'name': 'ZS_76'}),
ee.Feature(ee.Geometry.Point([-87.43664361701087,19.871777826738107]), {'name': 'ZS_77'}),
ee.Feature(ee.Geometry.Point([-87.43614734576283,19.873697730881325]), {'name': 'ZS_78'}),
ee.Feature(ee.Geometry.Point([-87.43503437821597,19.875670195149333]), {'name': 'ZS_79'}),
ee.Feature(ee.Geometry.Point([-87.43391797211994,19.877653603114645]), {'name': 'ZS_80'}),
ee.Feature(ee.Geometry.Point([-87.43349153423776,19.880211175864616]), {'name': 'ZS_81'}),
ee.Feature(ee.Geometry.Point([-87.43297606449765,19.881934456399797]), {'name': 'ZS_82'}),
ee.Feature(ee.Geometry.Point([-87.43236074523904,19.883591231162928]), {'name': 'ZS_83'}),
ee.Feature(ee.Geometry.Point([-87.43133077697732,19.88475148981296]), {'name': 'ZS_84'}),
ee.Feature(ee.Geometry.Point([-87.430193520355,19.885094521177496]), {'name': 'ZS_85'}),
ee.Feature(ee.Geometry.Point([-87.43031883460199,19.88783672174572]), {'name': 'ZS_86'}),
ee.Feature(ee.Geometry.Point([-87.43067167134085,19.889463130104797]), {'name': 'ZS_87'}),
ee.Feature(ee.Geometry.Point([-87.43112678265642,19.891173184096985]), {'name': 'ZS_88'}),
ee.Feature(ee.Geometry.Point([-87.43100340104174,19.892488900446327]), {'name': 'ZS_89'}),
ee.Feature(ee.Geometry.Point([-87.43080420602054,19.896094852435265]), {'name': 'ZS_90'}),
ee.Feature(ee.Geometry.Point([-87.43159813988895,19.900856527350328]), {'name': 'ZS_91'}),
ee.Feature(ee.Geometry.Point([-87.43228522445739,19.906841982209365]), {'name': 'ZS_92'}),
ee.Feature(ee.Geometry.Point([-87.43314281746336,19.911417056940085]), {'name': 'ZS_93'}),
ee.Feature(ee.Geometry.Point([-87.43486288847359,19.916620436950534]), {'name': 'ZS_94'}),
ee.Feature(ee.Geometry.Point([-87.43613215723454,19.923336243642925]), {'name': 'ZS_95'}),
ee.Feature(ee.Geometry.Point([-87.43660885863156,19.926633187064898]), {'name': 'ZS_96'}),
ee.Feature(ee.Geometry.Point([-87.43733841948361,19.928811855734104]), {'name': 'ZS_97'}),
ee.Feature(ee.Geometry.Point([-87.4388630372624,19.929701564477526]), {'name': 'ZS_98'}),
ee.Feature(ee.Geometry.Point([-87.4405581933598,19.930548811633955]), {'name': 'ZS_99'}),
ee.Feature(ee.Geometry.Point([-87.44208168808026,19.929721737081664]), {'name': 'ZS_100'}),
ee.Feature(ee.Geometry.Point([-87.44392704788251,19.929681391870805]), {'name': 'ZS_101'}),
ee.Feature(ee.Geometry.Point([-87.44564366165204,19.929721737081664]), {'name': 'ZS_102'}),
ee.Feature(ee.Geometry.Point([-87.44656634155317,19.92865258551394]), {'name': 'ZS_103'}),
ee.Feature(ee.Geometry.Point([-87.44819712463422,19.928995521710434]), {'name': 'ZS_104'}),
ee.Feature(ee.Geometry.Point([-87.4501074895492,19.930126751348155]), {'name': 'ZS_105'}),
ee.Feature(ee.Geometry.Point([-87.45222077636332,19.93257946537515]), {'name': 'ZS_106'}),
ee.Feature(ee.Geometry.Point([-87.4535608256467,19.9353122164422]), {'name': 'ZS_107'}),
ee.Feature(ee.Geometry.Point([-87.45490494973053,19.937999393390005]), {'name': 'ZS_108'}),
ee.Feature(ee.Geometry.Point([-87.45603431794214,19.940382041296566]), {'name': 'ZS_109'}),
ee.Feature(ee.Geometry.Point([-87.45693515717265,19.94276089912172]), {'name': 'ZS_110'}),
ee.Feature(ee.Geometry.Point([-87.45738187724533,19.944804471316864]), {'name': 'ZS_111'}),
ee.Feature(ee.Geometry.Point([-87.45760718280258,19.94671058876175]), {'name': 'ZS_112'}),
ee.Feature(ee.Geometry.Point([-87.45817307113637,19.947605401820045]), {'name': 'ZS_113'}),
ee.Feature(ee.Geometry.Point([-87.4598360407256,19.949390464949015]), {'name': 'ZS_114'}),
ee.Feature(ee.Geometry.Point([-87.4614860010929,19.951071590769246]), {'name': 'ZS_115'}),
ee.Feature(ee.Geometry.Point([-87.4633266483774,19.95372326604212]), {'name': 'ZS_116'}),
ee.Feature(ee.Geometry.Point([-87.46459343992035,19.95628566628739]), {'name': 'ZS_117'}),
ee.Feature(ee.Geometry.Point([-87.46531346342411,19.958578214751146]), {'name': 'ZS_118'}),
ee.Feature(ee.Geometry.Point([-87.46569254129713,19.961606855820353]), {'name': 'ZS_119'}),
ee.Feature(ee.Geometry.Point([-87.46553341529285,19.964227852948028]), {'name': 'ZS_120'}),
ee.Feature(ee.Geometry.Point([-87.46502915999805,19.96643625475562]), {'name': 'ZS_121'}),
ee.Feature(ee.Geometry.Point([-87.4664116042078,19.96915412171847]), {'name': 'ZS_122'}),
ee.Feature(ee.Geometry.Point([-87.46714487874534,19.971668281248064]), {'name': 'ZS_123'}),
ee.Feature(ee.Geometry.Point([-87.46743455731895,19.97438879686742]), {'name': 'ZS_124'}),
ee.Feature(ee.Geometry.Point([-87.46783152425316,19.977198495374413]), {'name': 'ZS_125'}),
ee.Feature(ee.Geometry.Point([-87.46822849118736,19.980324277329295]), {'name': 'ZS_126'}),
ee.Feature(ee.Geometry.Point([-87.46794954144981,19.981714217119574]), {'name': 'ZS_127'}),
ee.Feature(ee.Geometry.Point([-87.46735945546654,19.983014915998886]), {'name': 'ZS_128'}),
ee.Feature(ee.Geometry.Point([-87.46608808839348,19.98423998303136]), {'name': 'ZS_129'}),
ee.Feature(ee.Geometry.Point([-87.46467227684117,19.985551962621685]), {'name': 'ZN_130'}),
ee.Feature(ee.Geometry.Point([-87.46428990291051,19.986366482308636]), {'name': 'ZS_131'}),
ee.Feature(ee.Geometry.Point([-87.46420407222203,19.98700673124733]), {'name': 'ZS_132'}),
ee.Feature(ee.Geometry.Point([-87.46443830299718,19.987797867380984]), {'name': 'ZS_133'}),
ee.Feature(ee.Geometry.Point([-87.4643685655628,19.98851372959646]), {'name': 'ZS_134'}),
ee.Feature(ee.Geometry.Point([-87.46438230158532,19.989295849566066]), {'name': 'ZS_135'}),
ee.Feature(ee.Geometry.Point([-87.46402025304762,19.9902352590744]), {'name': 'ZS_136'}),
ee.Feature(ee.Geometry.Point([-87.46366620145766,19.991152757832854]), {'name': 'ZS_137'}),
ee.Feature(ee.Geometry.Point([-87.46445283130852,19.993013486672687]), {'name': 'ZS_138'}),
ee.Feature(ee.Geometry.Point([-87.46449574665276,19.993961215832904]), {'name': 'ZN_139'}), 
ee.Feature(ee.Geometry.Point([-87.4653325958654,19.993941051442075]), {'name': 'ZS_140'}),
ee.Feature(ee.Geometry.Point([-87.46637865738121,19.99351759863818]), {'name': 'ZS_141'}),
ee.Feature(ee.Geometry.Point([-87.46774437687904,19.992716698063845]), {'name': 'ZS_142'}),
ee.Feature(ee.Geometry.Point([-87.46886017582924,19.9922025012275]), {'name': 'ZS_143'}),
ee.Feature(ee.Geometry.Point([-87.47007881792256,19.991888731991914]), {'name': 'ZS_144'}),
ee.Feature(ee.Geometry.Point([-87.4711755817235,19.99208972650423]), {'name': 'ZS_145'}),
ee.Feature(ee.Geometry.Point([-87.47230074011168,19.99269943947065]), {'name': 'ZS_146'}),
ee.Feature(ee.Geometry.Point([-87.47319315433131,19.993418651033878]), {'name': 'ZS_147'}),
ee.Feature(ee.Geometry.Point([-87.47423921584712,19.994863993959186]), {'name': 'ZN_148'}),  
ee.Feature(ee.Geometry.Point([-87.47493354936715,19.996025618961102]), {'name': 'ZS_149'}),
ee.Feature(ee.Geometry.Point([-87.47610856798343,19.998336950032854]), {'name': 'ZN_150'}), 
ee.Feature(ee.Geometry.Point([-87.47662586145987,20.000267845310677]), {'name': 'ZS_151'}),
ee.Feature(ee.Geometry.Point([-87.47693897961743,20.00231207647122]), {'name': 'ZS_152'}),
ee.Feature(ee.Geometry.Point([-87.47721385876969,20.003813069424922]), {'name': 'ZS_153'}),
ee.Feature(ee.Geometry.Point([-87.47771811406449,20.005103504306895]), {'name': 'ZS_154'}),
ee.Feature(ee.Geometry.Point([-87.47786831776932,20.00597050930041]), {'name': 'ZS_155'}),
ee.Feature(ee.Geometry.Point([-87.47867298047379,20.006424172800372]), {'name': 'ZS_156'}),
ee.Feature(ee.Geometry.Point([-87.47964930455521,20.00678710265868]), {'name': 'ZS_157'}),
ee.Feature(ee.Geometry.Point([-87.47859787862137,20.007695022557495]), {'name': 'ZN_158'}),  
ee.Feature(ee.Geometry.Point([-87.4780077926381,20.008602338306016]), {'name': 'ZS_159'}),
ee.Feature(ee.Geometry.Point([-87.47792689352318,20.010696136563013]), {'name': 'ZN_160'}), 
ee.Feature(ee.Geometry.Point([-87.47757471798901,20.012245751814397]), {'name': 'ZS_161'}),
ee.Feature(ee.Geometry.Point([-87.47716702221875,20.013842996559806]), {'name': 'ZS_162'}),
ee.Feature(ee.Geometry.Point([-87.47693866049842,20.014791303037196]), {'name': 'ZS_163'}),
ee.Feature(ee.Geometry.Point([-87.47658236910631,20.01616567173281]), {'name': 'ZS_164'}),
ee.Feature(ee.Geometry.Point([-87.47644055393444,20.017133694318293]), {'name': 'ZS_165'}),
ee.Feature(ee.Geometry.Point([-87.47623313131612,20.018452578089413]), {'name': 'ZS_166'}),
ee.Feature(ee.Geometry.Point([-87.4761204785375,20.019255887965304]), {'name': 'ZS_167'}),
ee.Feature(ee.Geometry.Point([-87.47605074110311,20.02024978116066]), {'name': 'ZN_168'}),  
ee.Feature(ee.Geometry.Point([-87.47609902086538,20.021309183864354]), {'name': 'ZS_169'}),
ee.Feature(ee.Geometry.Point([-87.47620630922597,20.022507210939455]), {'name': 'ZN_170'}), 
ee.Feature(ee.Geometry.Point([-87.47627486727467,20.023405245850356]), {'name': 'ZS_171'}),
ee.Feature(ee.Geometry.Point([-87.47632314703694,20.024060464521718]), {'name': 'ZS_172'}),
ee.Feature(ee.Geometry.Point([-87.47637816039537,20.024764668564472]), {'name': 'ZS_173'}),
ee.Feature(ee.Geometry.Point([-87.47646935550188,20.02558116435264]), {'name': 'ZS_174'}),
ee.Feature(ee.Geometry.Point([-87.47653982554428,20.026331458150526]), {'name': 'ZS_175'}),
ee.Feature(ee.Geometry.Point([-87.47663102065079,20.027360635552856]), {'name': 'ZS_176'}),
ee.Feature(ee.Geometry.Point([-87.4768488040667,20.02856075833261]), {'name': 'ZS_177'}),
ee.Feature(ee.Geometry.Point([-87.47704211393541,20.029851528011054]), {'name': 'ZN_178'}),  
ee.Feature(ee.Geometry.Point([-87.47725627355916,20.031013792227075]), {'name': 'ZS_179'}),
ee.Feature(ee.Geometry.Point([-87.47746276479404,20.03227607777267]), {'name': 'ZN_180'}), 
ee.Feature(ee.Geometry.Point([-87.47757371739642,20.033223818339465]), {'name': 'ZS_181'}),
ee.Feature(ee.Geometry.Point([-87.4776997576925,20.034657402932773]), {'name': 'ZS_182'}),
ee.Feature(ee.Geometry.Point([-87.47772173756479,20.035904858325924]), {'name': 'ZS_183'}),
ee.Feature(ee.Geometry.Point([-87.47794612495376,20.036940819671127]), {'name': 'ZS_184'}),
ee.Feature(ee.Geometry.Point([-87.47841471566014,20.03810040951885]), {'name': 'ZS_185'}),
ee.Feature(ee.Geometry.Point([-87.47913472535873,20.040450225894492]), {'name': 'ZS_186'}),
ee.Feature(ee.Geometry.Point([-87.47926347139145,20.042445897776084]), {'name': 'ZS_187'}),
ee.Feature(ee.Geometry.Point([-87.47916691186691,20.044056514340774]), {'name': 'ZN_188'}),  
ee.Feature(ee.Geometry.Point([-87.4787561131612,20.04592127985551]), {'name': 'ZS_189'}),
ee.Feature(ee.Geometry.Point([-87.47865047588999,20.047612968803225]), {'name': 'ZN_190'}), 
ee.Feature(ee.Geometry.Point([-87.47852172985728,20.049850436525013]), {'name': 'ZS_191'}),
ee.Feature(ee.Geometry.Point([-87.47849912368149,20.052128896586424]), {'name': 'ZS_192'}),
ee.Feature(ee.Geometry.Point([-87.47820432769572,20.054420941804718]), {'name': 'ZS_193'}),
ee.Feature(ee.Geometry.Point([-87.47748407000297,20.05669200884111]), {'name': 'ZS_194'}),
ee.Feature(ee.Geometry.Point([-87.47711180093229,20.05854212105383]), {'name': 'ZS_195'}),
ee.Feature(ee.Geometry.Point([-87.47733710648954,20.060526356567678]), {'name': 'ZS_196'}),
ee.Feature(ee.Geometry.Point([-87.47767530261436,20.063185664712364]), {'name': 'ZS_197'}),
ee.Feature(ee.Geometry.Point([-87.47776090980639,20.064980544546884]), {'name': 'ZN_198'}),  
ee.Feature(ee.Geometry.Point([-87.47799569507542,20.067908417215236]), {'name': 'ZS_199'}),
ee.Feature(ee.Geometry.Point([-87.47820475796958,20.070618947660186]), {'name': 'ZN_200'}), 
ee.Feature(ee.Geometry.Point([-87.47829499311817,20.073114486023368]), {'name': 'ZS_201'}),
ee.Feature(ee.Geometry.Point([-87.47838082380665,20.075237955855794]), {'name': 'ZS_202'}),
ee.Feature(ee.Geometry.Point([-87.47821989126575,20.07704334888699]), {'name': 'ZS_203'}),
ee.Feature(ee.Geometry.Point([-87.47798385687244,20.07908399275756]), {'name': 'ZS_204'}),
ee.Feature(ee.Geometry.Point([-87.4774120199357,20.081456370640666]), {'name': 'ZS_205'}),
ee.Feature(ee.Geometry.Point([-87.47684340571256,20.084120532515772]), {'name': 'ZS_206'}),
ee.Feature(ee.Geometry.Point([-87.47639102492042,20.085713116506906]), {'name': 'ZS_207'}),
ee.Feature(ee.Geometry.Point([-87.47577473838204,20.08780147866777]), {'name': 'ZN_208'}),  
ee.Feature(ee.Geometry.Point([-87.47500226218575,20.090214264344286]), {'name': 'ZS_209'}),
ee.Feature(ee.Geometry.Point([-87.47445509154672,20.092472753119395]), {'name': 'ZN_210'}), 
ee.Feature(ee.Geometry.Point([-87.47409031112069,20.094286446426114]), {'name': 'ZS_211'}),
ee.Feature(ee.Geometry.Point([-87.47409031112069,20.096564234933602]), {'name': 'ZS_212'}),
ee.Feature(ee.Geometry.Point([-87.47387596852161,20.09942257510207]), {'name': 'ZS_213'}),
ee.Feature(ee.Geometry.Point([-87.47332879788257,20.10180515595417]), {'name': 'ZS_214'}),
ee.Feature(ee.Geometry.Point([-87.47236416724374,20.10406477361897]), {'name': 'ZS_215'}),
ee.Feature(ee.Geometry.Point([-87.47123751903338,20.10688699770322]), {'name': 'ZS_216'}),
ee.Feature(ee.Geometry.Point([-87.47036628216485,20.10910011340531]), {'name': 'ZS_217'}),
ee.Feature(ee.Geometry.Point([-87.46950309505345,20.111646279405207]), {'name': 'ZN_218'}),  
ee.Feature(ee.Geometry.Point([-87.46852258113626,20.11426831380041]), {'name': 'ZS_219'}),
ee.Feature(ee.Geometry.Point([-87.46768781019387,20.116773689823543]), {'name': 'ZN_220'}), 
ee.Feature(ee.Geometry.Point([-87.46671449255498,20.119927980118153]), {'name': 'ZN_221'}),  
ee.Feature(ee.Geometry.Point([-87.4658360922331,20.122836807525392]), {'name': 'ZN_222'}),
ee.Feature(ee.Geometry.Point([-87.46526746392195,20.124942242190517]), {'name': 'ZN_223'}),  
ee.Feature(ee.Geometry.Point([-87.46474711537306,20.127113127194317]), {'name': 'ZN_224'}),
   ];

var ZNWaypoints = ee.FeatureCollection(waypoints); //Generando una colección de features con los waypoints

//Generando gráfico del perfil de elevación de la ZS de la RBSK.
var chartZN = ui.Chart.image.byRegion({
  image: pendiente,
  regions: ZNWaypoints,
  reducer: ee.Reducer.median(), 
  scale: 30,
  xProperty: 'name'
});
//Caracteristicas que contendrá el gráfico
chartZN.setOptions({
  title: 'Pendiente en la ZN',
  hAxis: {title: 'Distribución de puntos de referencia S-N'},
  vAxis: {
    title: 'Pendiente (°)'
  },
  legend: 'none',
  lineWidth: 1,
  pointSize: 4
});

//4. ===========================Imprimiendo gráfico en la consola.============================================/
print(chartZN);

//3.========================================ZS.==========================================================/

//Distribución al azar de los puntos de referencia para generar el perfil.
var waypoints01 = [
ee.Feature(ee.Geometry.Point([-87.55037517822274,19.08779993953147]), {'name': 'ZS_01'}),
  ee.Feature( ee.Geometry.Point([-87.55011768615731,19.08861105348581]), {'name': 'ZS_02'}),
 ee.Feature(ee.Geometry.Point([-87.55159826553353,19.090395490197984]), {'name': 'ZS_03'}),
ee.Feature(ee.Geometry.Point([-87.55237455128719,19.09221360052593]), {'name': 'ZS_04'}),
ee.Feature(ee.Geometry.Point([-87.55243892430354,19.093977721264903]), {'name': 'ZS_05'}),
ee.Feature(ee.Geometry.Point([-87.5519453978448,19.096167638093306]), {'name': 'ZS_06'}),
ee.Feature(ee.Geometry.Point([-87.55118339891685,19.098935917583532]), {'name': 'ZS_07'}),
ee.Feature(ee.Geometry.Point([-87.55015343065513,19.10325476302704]), {'name': 'ZS_08'}),
ee.Feature(ee.Geometry.Point([-87.55012644734349,19.10762862307539]), {'name': 'ZS_09'}),
ee.Feature(ee.Geometry.Point([-87.54997624363865,19.11406512586427]), {'name': 'ZS_10'}),
ee.Feature(ee.Geometry.Point([-87.55061981846801,19.121903739770886]), {'name': 'ZS_11'}),
ee.Feature(ee.Geometry.Point([-87.55019066502562,19.12697209160083]), {'name': 'ZS_12'}),
ee.Feature(ee.Geometry.Point([-87.5500740318562,19.13075299072743]), {'name': 'ZS_13'}),
ee.Feature(ee.Geometry.Point([-87.54844324877514,19.135739982997475]), {'name': 'ZS_14'}),
ee.Feature(ee.Geometry.Point([-87.54818575670971,19.137402280287525]), {'name': 'ZS_15'}),
ee.Feature(ee.Geometry.Point([-87.54900114825024,19.141456593732336]), {'name': 'ZS_16'}),
ee.Feature(ee.Geometry.Point([-87.54887240221753,19.14471070047219]), {'name': 'ZS_17'}),
ee.Feature(ee.Geometry.Point([-87.54809992602124,19.147021569021074]), {'name': 'ZS_18'}),
ee.Feature(ee.Geometry.Point([-87.5445808677937,19.151359427854178]), {'name': 'ZS_19'}),
ee.Feature(ee.Geometry.Point([-87.54282133867993,19.15208914990945]), {'name': 'ZS_20'}),
ee.Feature(ee.Geometry.Point([-87.5417553408264,19.15324824252068]), {'name': 'ZS_21'}),
ee.Feature(ee.Geometry.Point([-87.54111161066282,19.154748206069577]), {'name': 'ZS_22'}),
ee.Feature(ee.Geometry.Point([-87.54106869531859,19.16001824011141]), {'name': 'ZS_23'}),
ee.Feature(ee.Geometry.Point([-87.54191023032588,19.1626730760042]), {'name': 'ZS_24'}),
ee.Feature(ee.Geometry.Point([-87.54251104514522,19.16530798744368]), {'name': 'ZS_25'}),
ee.Feature(ee.Geometry.Point([-87.54245485537685,19.167299086399346]), {'name': 'ZS_26'}),
ee.Feature(ee.Geometry.Point([-87.54185404055751,19.169204280806795]), {'name': 'ZS_27'}),
ee.Feature(ee.Geometry.Point([-87.54104387154473,19.17078297659021]), {'name': 'ZS_28'}),
ee.Feature(ee.Geometry.Point([-87.54003536095513,19.171988901180438]), {'name': 'ZS_29'}),
ee.Feature(ee.Geometry.Point([-87.53983302906934,19.17250429139033]), {'name': 'ZS_30'}),
ee.Feature(ee.Geometry.Point([-87.53996935758985,19.173438956567658]), {'name': 'ZS_31'}),
ee.Feature(ee.Geometry.Point([-87.54043017640171,19.175674500715292]), {'name': 'ZS_32'}),
ee.Feature(ee.Geometry.Point([-87.54058038010655,19.17772809442409]), {'name': 'ZS_33'}),
ee.Feature(ee.Geometry.Point([-87.54055892243443,19.179219918570585]), {'name': 'ZS_34'}),
ee.Feature(ee.Geometry.Point([-87.54023705735264,19.18015218305193]), {'name': 'ZS_35'}),
ee.Feature(ee.Geometry.Point([-87.54000102295933,19.18178434085125]), {'name':'ZS_36'}),
ee.Feature(ee.Geometry.Point([-87.53986154809056,19.183155862203627]), {'name':'ZS_37'}),
ee.Feature(ee.Geometry.Point([-87.53970061554966,19.183713181546267]), {'name':'ZS_38'}),
ee.Feature(ee.Geometry.Point([-87.53920708909092,19.18429076505662]), {'name': 'ZS_39'}),
ee.Feature(ee.Geometry.Point([-87.53856335892735,19.184564356538676]), {'name': 'ZS_40'}),
ee.Feature(ee.Geometry.Point([-87.53831659569798,19.184979809401483]), {'name': 'ZS_41'}),
ee.Feature(ee.Geometry.Point([-87.53814671282917,19.185908121920807]), {'name': 'ZS_42'}),
ee.Feature(ee.Geometry.Point([-87.53873679881245,19.188036022787642]), {'name': 'ZS_43'}),
ee.Feature(ee.Geometry.Point([-87.53880744284722,19.188726905935102]), {'name': 'ZS_44'}),
ee.Feature(ee.Geometry.Point([-87.53941898650261,19.190935831329067]), {'name': 'ZS_45'}),
ee.Feature(ee.Geometry.Point([-87.53991251296135,19.19209137518416]), {'name': 'ZS_46'}),
ee.Feature(ee.Geometry.Point([-87.54025583571526,19.194026680127603]), {'name': 'ZS_47'}),
ee.Feature(ee.Geometry.Point([-87.54040603942009,19.195918912597897]), {'name': 'ZS_48'}),
ee.Feature(ee.Geometry.Point([-87.54030947989556,19.197692057391148]), {'name': 'ZS_49'}),
ee.Feature(ee.Geometry.Point([-87.5399653896219,19.200203626451508]), {'name': 'ZS_50'}),
ee.Feature(ee.Geometry.Point([-87.53889771228162,19.20363365122794]), {'name': 'ZS_51'}),
ee.Feature(ee.Geometry.Point([-87.53825398211805,19.205923430106484]), {'name': 'ZS_52'}),
ee.Feature(ee.Geometry.Point([-87.53688202037887,19.20972514112978]), {'name': 'ZS_53'}),
ee.Feature(ee.Geometry.Point([-87.53585583316705,19.212610242805695]), {'name': 'ZS_54'}),
ee.Feature(ee.Geometry.Point([-87.53454691516778,19.21485937212583]), {'name': 'ZS_55'}),
ee.Feature(ee.Geometry.Point([-87.53529793369195,19.213967829049324]), {'name': 'ZS_56'}),
ee.Feature(ee.Geometry.Point([-87.53334636926655,19.21740114388209]), {'name': 'ZS_57'}),
ee.Feature(ee.Geometry.Point([-87.53193016290669,19.219366543648153]), {'name': 'ZS_58'}),
ee.Feature(ee.Geometry.Point([-87.5304993670757,19.221063980597712]), {'name': 'ZS_59'}),
ee.Feature(ee.Geometry.Point([-87.52957668717458,19.222137837799583]), {'name': 'ZS_60'}),
ee.Feature(ee.Geometry.Point([-87.5290402453716,19.22416396435185]), {'name': 'ZS_61'}),
ee.Feature(ee.Geometry.Point([-87.52856424033219,19.227022399474684]), {'name': 'ZS_62'}),
ee.Feature(ee.Geometry.Point([-87.52892902075821,19.225948574195954]), {'name': 'ZS_63'}),
ee.Feature(ee.Geometry.Point([-87.52740289531731,19.22910035910348]), {'name': 'ZS_64'}),
ee.Feature(ee.Geometry.Point([-87.52613689266228,19.23055911091646]), {'name': 'ZS_65'}),
ee.Feature(ee.Geometry.Point([-87.52467777095818,19.231531604927632]), {'name': 'ZS_66'}),
ee.Feature(ee.Geometry.Point([-87.52255346141838,19.23258513360834]), {'name': 'ZS_67'}),
ee.Feature(ee.Geometry.Point([-87.52148647197615,19.233765972665772]), {'name': 'ZS_68'}),
ee.Feature(ee.Geometry.Point([-87.52086419948469,19.234860006660394]), {'name': 'ZS_69'}),
ee.Feature(ee.Geometry.Point([-87.51944799312483,19.23613637044176]), {'name': 'ZS_70'}),
ee.Feature(ee.Geometry.Point([-87.51796741374861,19.2368049379867]), {'name': 'ZS_71'}),
ee.Feature(ee.Geometry.Point([-87.51573581584822,19.235974293051214]), {'name': 'ZS_72'}),
ee.Feature(ee.Geometry.Point([-87.51509208568464,19.235629878065087]), {'name': 'ZS_73'}),
ee.Feature(ee.Geometry.Point([-87.51382608302961,19.23674415923148]), {'name': 'ZS_74'}),
ee.Feature(ee.Geometry.Point([-87.51262445339094,19.239600736405514]), {'name': 'ZS_75'}),
ee.Feature(ee.Geometry.Point([-87.51034994014631,19.242214157088817]), {'name': 'ZS_76'}),
ee.Feature(ee.Geometry.Point([-87.50902330091411,19.243584500563024]), {'name': 'ZS_77'}),
ee.Feature(ee.Geometry.Point([-87.50739251783305,19.244536658799877]), {'name': 'ZS_78'}),
ee.Feature(ee.Geometry.Point([-87.50662004163676,19.245225450676735]), {'name': 'ZS_79'}),
ee.Feature(ee.Geometry.Point([-87.50552570035869,19.247129742585596]), {'name': 'ZS_80'}),
ee.Feature(ee.Geometry.Point([-87.50408831058371,19.24854730009886]), {'name': 'ZS_81'}),
ee.Feature(ee.Geometry.Point([-87.50181379733908,19.24953994556479]), {'name': 'ZS_82'}),
ee.Feature(ee.Geometry.Point([-87.50078382907736,19.250269232284314]), {'name': 'ZS_83'}),
ee.Feature(ee.Geometry.Point([-87.49904575763571,19.2529635134419]), {'name': 'ZS_84'}),
ee.Feature(ee.Geometry.Point([-87.49980268903745,19.252062778941184]), {'name': 'ZS_85'}),
ee.Feature(ee.Geometry.Point([-87.49731359907163,19.255324235887752]), {'name': 'ZS_86'}),
ee.Feature(ee.Geometry.Point([-87.49508200117124,19.2574714951201]), {'name': 'ZS_87'}),
ee.Feature(ee.Geometry.Point([-87.4928060464286,19.259655199725863]), {'name': 'ZS_88'}),
ee.Feature(ee.Geometry.Point([-87.49048861783973,19.26091111405002]), {'name': 'ZS_89'}),
ee.Feature(ee.Geometry.Point([-87.4891153268241,19.262450608808205]), {'name': 'ZS_90'}),
ee.Feature(ee.Geometry.Point([-87.48851451200477,19.264435725448152]), {'name': 'ZS_91'}),
ee.Feature(ee.Geometry.Point([-87.48748454374305,19.265691603153247]), {'name': 'ZS_92'}),
ee.Feature(ee.Geometry.Point([-87.48606833738319,19.266096722941167]), {'name': 'ZS_93'}),
ee.Feature(ee.Geometry.Point([-87.48525294584266,19.267271564664174]), {'name': 'ZS_94'}),
ee.Feature(ee.Geometry.Point([-87.48373630605678,19.270944843140036]), {'name': 'ZS_95'}),
ee.Feature(ee.Geometry.Point([-87.47901561819057,19.27592758722218]), {'name': 'ZS_96'}),
ee.Feature(ee.Geometry.Point([-87.47752104717904,19.27876824136691]), {'name': 'ZS_97'}),
ee.Feature(ee.Geometry.Point([-87.47464571911507,19.28168484871766]), {'name': 'ZS_98'}),
ee.Feature(ee.Geometry.Point([-87.47385178524667,19.28229246871187]), {'name': 'ZS_99'}),
ee.Feature(ee.Geometry.Point([-87.47292910534554,19.282251960782396]), {'name': 'ZS_100'}),
ee.Feature(ee.Geometry.Point([-87.47224245983773,19.28261653178702]), {'name': 'ZS_101'}),
ee.Feature(ee.Geometry.Point([-87.47078333813363,19.284074807689635]), {'name': 'ZS_102'}),
ee.Feature(ee.Geometry.Point([-87.46774512117666,19.288128387497625]), {'name': 'ZS_103'}),
ee.Feature(ee.Geometry.Point([-87.46908747947772,19.286275810743312]), {'name': 'ZS_104'}),
ee.Feature(ee.Geometry.Point([-87.46475302970966,19.291379605520405]), {'name': 'ZS_105'}),
ee.Feature(ee.Geometry.Point([-87.46268089413773,19.293650070978444]), {'name': 'ZS_106'}),
ee.Feature(ee.Geometry.Point([-87.46105011105668,19.295857584829214]), {'name': 'ZS_107'}),
ee.Feature(ee.Geometry.Point([-87.46155953018594,19.295367968620802]), {'name': 'ZS_108'}),
ee.Feature(ee.Geometry.Point([-87.45943522064614,19.297615963436797]), {'name': 'ZS_109'}),
ee.Feature(ee.Geometry.Point([-87.45683884231973,19.30008669688881]), {'name': 'ZS_110'}),
ee.Feature(ee.Geometry.Point([-87.45531395368738,19.30182084438165]), {'name': 'ZS_111'}),
ee.Feature(ee.Geometry.Point([-87.45331878644208,19.30428098913903]), {'name': 'ZS_112'}),
ee.Feature(ee.Geometry.Point([-87.45134468060712,19.30634660271959]), {'name': 'ZS_113'}),
ee.Feature(ee.Geometry.Point([-87.44960256000616,19.308603999381457]), {'name': 'ZS_114'}),
ee.Feature(ee.Geometry.Point([-87.44855113407232,19.310122795288418]), {'name': 'ZS_115'}),
ee.Feature(ee.Geometry.Point([-87.44713492771245,19.311034066061392]), {'name': 'ZS_116'}),
ee.Feature(ee.Geometry.Point([-87.44623370548345,19.31186433056632]), {'name': 'ZS_117'}),
ee.Feature(ee.Geometry.Point([-87.44565434833623,19.312208585344102]), {'name': 'ZS_118'}),
ee.Feature(ee.Geometry.Point([-87.44698472400762,19.31261359003701]), {'name': 'ZS_119'}),
ee.Feature(ee.Geometry.Point([-87.44859404941656,19.312897092725112]), {'name': 'ZS_120'}),
ee.Feature(ee.Geometry.Point([-87.44994588276006,19.312795841821508]), {'name': 'ZS_121'}),
ee.Feature(ee.Geometry.Point([-87.45159812351324,19.312492088734473]), {'name': 'ZS_122'}),
ee.Feature(ee.Geometry.Point([-87.45327182193853,19.312836342190472]), {'name': 'ZS_123'}),
ee.Feature(ee.Geometry.Point([-87.45414632266744,19.313406019960322]), {'name': 'ZS_124'}),
ee.Feature(ee.Geometry.Point([-87.45547669833883,19.314560272236218]), {'name': 'ZS_125'}),
ee.Feature(ee.Geometry.Point([-87.45717185443624,19.315714516362448]), {'name': 'ZS_126'}),
ee.Feature(ee.Geometry.Point([-87.45848077243551,19.31664600567962]), {'name': 'ZS_127'}),
ee.Feature(ee.Geometry.Point([-87.45976823276266,19.31782048464407]), {'name': 'ZS_128'}),
ee.Feature(ee.Geometry.Point([-87.48144483120599,19.273534077207877]), {'name': 'ZS_129'}),
ee.Feature(ee.Geometry.Point([-87.46610370478734,19.289891759614225]), {'name': 'ZS_130'}),  
   ];
var ZSWaypoints = ee.FeatureCollection(waypoints01); //Generando una colección de features con los waypoints

//Generando gráfico del perfil de elevación de la ZS de la RBSK.
var chartZS = ui.Chart.image.byRegion({
  image: pendiente,
  regions: ZSWaypoints,
  reducer: ee.Reducer.median(), 
  scale: 30,
  xProperty: 'name'
});
//Caracteristicas que cntendrá el gráfico
chartZS.setOptions({
  title: 'Pendiente en la ZS',
  hAxis: {title: 'Distribución de puntos de referencia S-N'},
  vAxis: {
    title: 'Pendiente (°)'
  },
  legend: 'none',
  lineWidth: 1,
  pointSize: 4
});

//4. ===========================Imprimiendo gráfico en la consola.============================================/
print(chartZS);

//========================================15. Exportando Imagen de pendiente por zona de estudio.======================================================/

//======================================1.Zonas de estudio (ZN-ZS).==================================================/
 Export.image.toDrive({  image: pendiente,
  description: 'Pendiente',
  folder: "GEE",
  scale: 30,
  crs: 'EPSG:32616',
  region: zonas});

///=======================================2.ZS.================================================/
// Export.image.toDrive({
//image: pendiente,
//description: 'Pendiente_ZS',
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

//====================================17.Añadir al mapa el valor de la mediana de la imagen y perimetro del área de estudio.==========================/

Map.addLayer(ZSWaypoints, {color: '98ff00'},'Puntos_ZS');
Map.addLayer(ZNWaypoints, {color: '0b4a8b'},'Puntos_ZN');
Map.addLayer (Sian_Per,{color:'red'}, 'RBSK');
Map.addLayer (ZN, {color:'blue'}, 'ZN');
Map.addLayer (ZS, {color:'cyan'}, 'ZS');

//======================================18.Centrar el mapa en el archivo vectorial de la RBSK (Perimetro).==================================================/
Map.centerObject (Sian_Per, 10);
