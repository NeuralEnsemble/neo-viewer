# Neo Viewer Service

The Neo Viewer Service provides a REST API for reading electrophysiology data
from any file format supported by [Neo](http://neuralensemble.org/neo) and exposing it in JSON format.

It is implemented with [FastAPI](https://fastapi.tiangolo.com/).

## API Documentation

See [here](https://neoviewer.apps.ebrains.eu/api/docs).

## Deployment

The easiest way to deploy the web service is as a Docker container.

Clone the Git repository using:
```
git clone https://github.com/NeuralEnsemble/neo-viewer.git
```

Build the Docker image using:
```
docker build -t neo-viewer -f deployment/Dockerfile.prod .
```

Run the Docker container using:
```
docker run -d -p 80:80 --name neo-viewer neo-viewer
```

To check everything has worked, run
```
docker logs neo-viewer
```


<div><img src="../eu_logo.jpg" alt="EU Logo" width="15%" align="right"></div>


## Acknowledgements
This open source software code was developed in part or in whole in the Human Brain Project, funded from the European Union's Horizon 2020 Framework Programme for Research and Innovation under Specific Grant Agreements No. 720270, No. 785907 and No. 945539 (Human Brain Project SGA1, SGA2 and SGA3)
and by the European Union's Research and Innovation Program Horizon Europe Grant Agreement No. 101147319 (EBRAINS 2.0).
