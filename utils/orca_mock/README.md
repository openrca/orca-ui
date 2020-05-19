# OpenRCA API Mock

This repository contains the source code for the OpenRCA API mock. The purpose of the mock is to
facilitate the development of the web interface by removing the requirement for deploying a
Kubernetes cluster with full-stack monitoring and other related components. The developer can run
the mock alongside the UI application and receive the same responses as they would receive when
using the real OpenRCA deployment.

## Usage

Build Docker image:

```bash
$ docker build -t openrca/orca-mock .
```

Run Docker container:

```
$ docker run --name orca-mock -p 5000:5000 openrca/orca-mock
```

Swagger UI is available at: http://localhost:5000/v1
