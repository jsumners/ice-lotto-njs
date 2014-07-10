# Database Migrations

[Database migrations](http://en.wikipedia.org/wiki/Schema_migration) are provided by the [node-db-migrate](https://github.com/kunklejr/node-db-migrate) module. These migrations can be created, and executed, via [Grunt](http://gruntjs.com) tasks provided by the [grunt-db-migrate](https://github.com/unknownexception/grunt-db-migrate) module.

For example, to create a new migration named `foo`:

```bash
$ grunt migrate:create:foo
```

And to run an upward migration:

```bash
$ grunt migrate:up # or just `grunt migrate`
```