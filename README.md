# OpenRCA UI

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/3912/badge)](https://bestpractices.coreinfrastructure.org/projects/3912)
[![License](https://img.shields.io/github/license/openrca/orca)](https://github.com/openrca/orca-ui)
[![Gitter](https://img.shields.io/gitter/room/openrca/community)](https://gitter.im/openrca/community)

This repository contains the source code for the OpenRCA web interface.

## Usage

### Build and run in Docker

Build Docker image:

```bash
$ docker build -t openrca/orca-ui .
```

Run Docker container:

```
$ docker run -it --name orca-ui -p 3000:3000 openrca/orca-ui
```

### Build and run locally

Install dependencies:
```bash
$ yarn
```

Build:
```bash
$ yarn build
```

Run:
```bash
$ yarn start
```

## Development

Navigate to `utils` directory.
Build and start containers by executing command below (requres `docker-compose`):

```sh
docker-compose up
```

Orca UI is now available at [http://localhost](http://localhost).

The code can be modified locally as it is bound to running container.
It will be recompiled on the fly.
Hot reload feature is also enabled, so any changes should be
visible without reloading the webpage.

## Contact

Reach project contributors via these channels:

-   [Gitter chat room](https://gitter.im/openrca/community)
-   [Github issues](https://github.com/openrca/orca-ui/issues)
