# Neo Viewer Service

The Neo Viewer Service is a Django app that provides a REST API for reading electrophysiology data
from any file format supported by [Neo](http://neuralensemble.org/neo) and exposing it in JSON format.

## API Documentation

See [here](https://neo-viewer.brainsimulation.eu/#api-docs).

## Deployment

The easiest way to deploy the web service is as a Docker container.

Clone the Git repository using:
```
git clone https://github.com/NeuralEnsemble/neo-viewer.git
```

Obtain an SSL certificate using LetsEncrypt, and then modify `api/deployment/nginx-app.conf` to set the 
correct values of `server_name`, `ssl_certificate` and `ssl_certificate_key` for your server.

Set the appropriate value for `ALLOWED_HOSTS` in `api/neural_activity_app/settings.py`.

Change to the `src/neural-activity-visualizer/api` directory, then build the Docker image using:
```
docker build -t neo-viewer -f deployment/Dockerfile .
```

Run the Docker container using 
```
docker run -d -p 443:443 --name neo-viewer -v /etc/letsencrypt:/etc/letsencrypt neo-viewer
```

To check everything has worked, run
```
docker logs neo-viewer
```


<div><img src="../eu_logo.jpg" alt="EU Logo" width="15%" align="right"></div>


## Acknowledgements
This open source software code was developed in part or in whole in the Human Brain Project, funded from the European Union's Horizon 2020 Framework Programme for Research and Innovation under Specific Grant Agreements No. 720270, No. 785907 and No. 945539 (Human Brain Project SGA1, SGA2 and SGA3).
