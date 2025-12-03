# VCA_RBSK_DCA.
Estimación de variables climaticas ambientales en la reserva de la biosfera de sian ka´an (RBSK).

# Estructura de script para la extracción y análisis de variables climaticas ambientales (VCA) en el área de estudio.

## Descripción 📋
El presente código se encuentra estructurado para obtener los valores mensuales por año de las variables climaticas ambientales, dentro de la plataforma Google Earth Engine para la Reserva de la Bisofera de Sian Ka´an (RBSK), Quintana Roo, México. 

Éste se compone de dos secciones, una donde se obtienen las series de tiempo de la temporalidad total correspondiente a 10 años, y la segunda para exportar las capas raster con valores estimados de las variables climáticas obtenidas como: Precipitacion, Temperatura máxima y miníma, así como la estimación de la pendiente mediante puntos al azar distribuidos sobre las zonas de estudio.   [**GEE**](https://developers.google.com/earth-engine/guides/getstarted?hl=en).

El repostirorio se elaboró de acuerdo a los lineamientos de la [**licencia GNU General Public License v3.0.**](https://choosealicense.com/licenses/gpl-3.0/).

##Visualización de la Reserva de la Bisofera de Sian Ka´an (RBSK), a tráves de la colección 2 de Landsat 7, con composición de bandas B (3, 2, 1), en GEE.

![alt text](https://github.com/demostenesmx/NDVI-SAVI_DCA/blob/main/C02_B_3_2_1_RBSK.JPG) 📖

Estimaciones.

Con la ejecución de este código se obtendrán series de tiempo con valores mensuales por año durante un periodo de 10 años, de las variables climaticas estimadas  para la zona norte y sur de la RBSK, con el empleo del catalogo de Terraclimate.

Ejemplos de los datos mensuales:

1. ![alt text](https://github.com/demostenesmx/VCA_RBSK_DCA/blob/main/PrepM_ZN-ZS.png)

2. ![alt text](https://github.com/demostenesmx/VCA_RBSK_DCA/blob/main/temmaxM_ZN-ZS.png)

3.![alt text](https://github.com/demostenesmx/VCA_RBSK_DCA/blob/main/temminM_ZN-ZS.png)

De igual forma, se presenta la estimación de la pendiente con puntos al zar dentro de la ZN y ZS con el catalogo de Modelo Diggital de Elavación a 30m de resolución de la NASA SRTM.

1. ![alt text](https://github.com/demostenesmx/VCA_RBSK_DCA/blob/main/Pend-ZN.png)

2. ![alt text](https://github.com/demostenesmx/VCA_RBSK_DCA/blob/main/Pend-ZS.png)


### Capas raster VCA. 
Las capas raster de exportación se ubicaran dentro de la pestaña Tasks, para su descarga en google drive y posteriormente ser descargadas a la PC personal para su manipulación. Este script fue elaborado mendiante la plataforma GEE. Se puede acceder a través del siguiente link: https://code.earthengine.google.com/?accept_repo=users/veronica78mere/DCA_Tesis

![alt text](https://github.com/demostenesmx/VCA_RBSK_DCA/blob/main/Tasks_VCA.JPG)

La manipulación de la información contenida en los rasaters puede realizarse, a traves, del sistema de información geografica de su preferencia. Para el presente caso de estudio se utilizó el software de acceso libre QGIS.

![alt text](https://github.com/demostenesmx/NDVI-SAVI_DCA/blob/main/QGis.JPG)

Citar: Gayosso-Soto, E.; Cohuo, S.; Sánchez-Sánchez, J.A.; Villegas-Sánchez, C.A.; Castro-Pérez, J.M.; Cutz-Pool, L.Q.; Macario-González, L. Coastal Dune Vegetation Dynamism and Anthropogenic-Induced Transitions in the Mexican Caribbean during the Last Decade. Plants 2024, 13, 1734. https://doi.org/10.3390/plants13131734

