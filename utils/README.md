# Utils

## Quickstart

1. Build `orca-ui` and `api-mock`

   ```sh
   docker-compose build
   ```

2. Run contaiers

   ```sh
   docker-compose up
   ```

3. Access services

   service | port
   --- | ---
   orca-ui | 3000
   orca-api-mock | 5000 _(of loopback interface on orca-ui container)_
