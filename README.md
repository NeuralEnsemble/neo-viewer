# Neural Activity Visualizer

A JavaScript component for visualizing neural activity data (analog signals, 
spike trains etc.) stored in any of the file formats supported by the 
[Neo](http://neuralensemble.org/neo) library. Implementations are available in 
both AngularJS and ReactJS.

Homepage:
https://neo-viewer.brainsimulation.eu/

## Quick overview

The component was developed to produce graphical representations of neural activity data based on the Neo object model. [Neo](http://neuralensemble.org/neo) is an open source API implemented in Python supporting many file formats, including several proprietary formats (e.g. AlphaOmega, Plexon, NeuroExplorer), open formats (e.g. Neurodata Without Borders, Klustakwik, Elan) and generic file formats (e.g. MATLAB, ASCII, HDF5). Neo loads this data into a common object model with the aim of increasing interoperability of various software tools used in electrophysiology and thus facilitating sharing of data between different projects. Neo's focus is solely on the structure of the data, with separate tools being required for their analysis. Our compoment comes in at this stage by enabling interactive visualization of data. It makes use of the open source [Plotly](https://plotly.com/javascript/) library for visualisation, owing to its efficiency in handling large data, and [Django](https://www.djangoproject.com/) Python web framework for the backend.


## AngularJS (v1) component

Live demo: 
https://neo-viewer.brainsimulation.eu/angularjs


For more details, see [here](/js/angularjs/README.md).


## ReactJS component

Live demo:
https://neo-viewer.brainsimulation.eu/react

For more details, see [here](/js/react/README.md).


## Deploying the file server

By default, the visualizer uses the Neo file server at https://neo-viewer.brainsimulation.eu/. This is fine for testing and light use, but for better performance you may wish to deploy your own server on a more powerful machine.
Instructions for doing this are [here](/api/README.md#deployment).


## Reference: the file server REST API

See [here](https://neo-viewer.brainsimulation.eu/api-docs).


<div><img src="eu_logo.jpg" alt="EU Logo" width="15%" align="right"></div>


## Acknowledgements
This open source software code was developed in part or in whole in the Human Brain Project, funded from the European Union's Horizon 2020 Framework Programme for Research and Innovation under Specific Grant Agreements No. 720270, No. 785907 and No. 945539 (Human Brain Project SGA1, SGA2 and SGA3).
