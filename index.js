postTo(
    'localhost:3000/path/resource',
    {'Content-Type': 'text/plain'},
    'success'
).fork(
    process.exit,
    process.exit
);

