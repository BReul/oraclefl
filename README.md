# oraclefl

forked from https://github.com/tb01923/spikes/tree/master/spikes 

# Usage

Run `npm install oraclefl` or `yarn add oraclefl` to install this package.

# Docs

### Bindings

A simple set of bindings to simplify binding queries
Bindings include:
* `BIND_OUT_NUMBER`
* `BIND_IN_NUMBER`
* `BIND_IN_STRING`

### Builders

A set of defined builders that already have a formatter associated with the query.
You can use these in lieu of `executeOracle` or `executeManyOracle` if you don't want to specify your own formating function.

Builders include:
* `buildSelectOneStatement`
* `buildSelectAllStatement`
* `buildUpdateStatement`
* `buildUpdateBatchStatement`
* `buildProcedure`

### Executers

A set of fluture wrappers around oracle's `.execute` and `.executeMany` functions.
Their respective type signatures are below:
* `executeOracle :: formatter -> query -> binding -> oracledb -> Future Result`
* `executeManyOracle :: formatter -> query -> bindings -> bindingDefinitions -> oracledb -> Future Result`

The `withConnection` function requires an oracle connection to be passed, and
depending on the execution function you select (`executeSingle` or `executeInSeries`),
will apply the connection to your query or your sequence of queries.

### Helpers

A set of helper functions that simplify the executers.