"""
Metadata for Neo Viewer API.

Copyright CNRS 2023
Authors: Andrew P. Davison, Onur Ates, Shailesh Appukuttan, Hélissande Fragnaud and Corentin Fragnaud
Licence: MIT (see LICENSE)
"""


title="Neo Viewer API"

description = """
The Neo Viewer API transforms neurophysiology data from a large number of file formats
into JSON, for visualization in a web-browser using Javascript plotting tools.

For example, [neural-activity-visualizer-react](https://www.npmjs.com/package/neural-activity-visualizer-react)
is a React component for visualizing neural activity data, which uses the Neo Viewer API.

The API follows the [Neo](https://neo.readthedocs.io/en/latest/) container structure: the outermost container is the Block,
which contains one or more Segments (a continuous recording period,
corresponding for example to one trial or one stimulus presentation).
Each segment contains one or more AnalogSignals, each of which may be multi-channel,
and any number of SpikeTrains.

Other Neo objects like Events, Epochs, Groups, are not yet supported,
but are planned for a future version.

### Versions

Version 1 is available at `/api/v1`.

For backwards compatibility reasons, version 1 is also available at `/api`, but use of this is deprecated,
and we recommend that new users use the versioned endpoints.
Version 2 is under development.

### Acknowledgments

This project has received funding from the European Union’s Horizon 2020 Framework Programme for Research and Innovation
under the Specific Grant Agreements No. 785907 and No. 945539 (Human Brain Project SGA2 and SGA3)
and by the European Union's Research and Innovation Program Horizon Europe Grant Agreement No. 101147319 (EBRAINS 2.0).
"""