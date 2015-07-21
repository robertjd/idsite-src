# Stormpath ID Site Source #

[Stormpath](http://stormpath.com/) is a User Management API that reduces development time with instant-on, scalable user infrastructure. Stormpath's intuitive API and expert support make it easy for developers to authenticate, manage, and secure users and roles in any application.

This is the development environment for the Stormpath hosted ID Site.  You can use this repository to build the same single page application (SPA) that Stormpath provides, or you can modify it to suit your needs.  The SPA uses Angular and Browserify and it is built using Grunt and Yeoman.

### Usage

It is assumed that you have Node.JS installed and that you have Bower and Grunt installed as global packages.

After cloning this repository you should run `npm install` and `bower install` within the repository.

Then you must configure the following:

* Export the following variables to your environment, these are required
so that we can use a real Stormpath Application to generate JWT access tokens
that allow the ID Site application to talk to the Stormpath API;

```
STORMPATH_CLIENT_APIKEY_ID=YOUR_KEY_ID
STORMPATH_CLIENT_APIKEY_SECRET=YOUR_KEY_SECRET
STORMPATH_APPLICATION_HREF=YOUR_APPLICATION_HREF
```

* Add the following URL to the "Authorized Javascript Origins" and "Authorized
Redirect URLs" in your ID Site configuration:

```
http://localhost:9000
```

Once you have done the above tasks, you can start the development server
with this Grunt command:

```
grunt serve
```
The following will happen:
 * The development server is started
 * The application is loaded in your browser
 * A watcher is started, it will watch files for edits and reload the application in the browser.

### Building your application

After you make your modifications, you want to build the application to produce
the minified output.  This output is what you will commit to a separate repository,
and configuring your ID Site configuration to point at this repository.

* `grunt build` will build the the application and place it in the `dist/` folder.  All assets will be minified.
* `grunt build:debug` will also build the application to `dist/`, but without minifying the javascript assets

### Testing

To run the Selenium tests, you need to install Protractor:

```
npm install -g protractor
```

Start the development server by running `grunt serve`,
then run Protractor with the config file in this repo:

```
protractor protractor.conf.js
```

**WARNING**: This will modify the ID Site Configuration of the Stormpath Tenant
that is defined by these environment variables:

```
STORMPATH_CLIENT_APIKEY_ID
STORMPATH_CLIENT_APIKEY_SECRET
```
Alas, you must ensure that you are using a tenant that is not userd with your
production application!

### Contributing

You can make your own contributions by forking the <code>development</code> branch, making your changes, and issuing pull-requests on the <code>development</code> branch.

We regularly maintain our GitHub repostiory, and are quick about reviewing pull requests and accepting changes!

### Copyright ###

Copyright &copy; 2014 Stormpath, Inc. and contributors.

This project is open-source via the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).