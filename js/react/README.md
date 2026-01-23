# neural-activity-visualizer-react

> A ReactJS component for visualizing neural activity data

[![NPM](https://img.shields.io/npm/v/neural-activity-visualizer-react.svg)](https://www.npmjs.com/package/neural-activity-visualizer-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save neural-activity-visualizer-react
```

## Usage

#### Basic Usage:
```jsx
import React from 'react';
import Visualizer from 'neural-activity-visualizer-react';

function Example {
  const source = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf";

  return (
    <Visualizer source={source} />
  )
}
```

#### Interactive Demo:

Explore the demo app:
https://neo-viewer.netlify.app/


## Deploying the file server

By default, the visualizer uses the Neo file server at https://neoviewer.apps.ebrains.eu/. This is fine for testing and light use, but for better performance you may
wish to deploy your own server on a more powerful machine.

Instructions for doing this are [here](https://github.com/NeuralEnsemble/neo-viewer/blob/master/api/README.md#deployment).


## Reference: the file server REST API

See [here](https://neoviewer.apps.ebrains.eu/api/docs).


<div><img src="../../eu_logo.jpg" alt="EU Logo" width="15%" align="right"></div>


## Acknowledgements
This open source software code was developed in part or in whole in the Human Brain Project, funded from the European Union's Horizon 2020 Framework Programme for Research and Innovation under Specific Grant Agreements No. 720270, No. 785907 and No. 945539 (Human Brain Project SGA1, SGA2 and SGA3).