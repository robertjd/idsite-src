'use strict';

var request = require('request');

var uuid = require('node-uuid');

var stormpath = require('stormpath');

var async = require('async');

require('colors');

var client;

try{
  client = new stormpath.Client({
    apiKey: new stormpath.ApiKey(
      process.env.STORMPATH_CLIENT_APIKEY_ID,
      process.env.STORMPATH_CLIENT_APIKEY_SECRET
    )
  });
}catch(e){
  console.log('Could not initialize a client for testing');
  throw(e);
}

var ready = false;

var resources = {
  application: null,
  directory: null,
  loginAccount: null,
  googleDirectory: null,
  facebookDirectory: null
};

function createAccount(directory,cb){
  console.log('Create Account'.blue);
  var newAccount = {
    email: 'nobody+'+uuid()+'@stormpath.com',
    givenName: uuid(),
    surname: uuid(),
    password: uuid() + uuid().toUpperCase()
  };
  directory.createAccount(newAccount,function(err,account){
    if(err){
      throw err;
    }else{
      account.password = newAccount.password;
      cb(null,account);
    }
  });
}

function createDirectory(client,directoryConfig,cb){
  console.log(('Create Directory ' + directoryConfig.name).blue);

  client.createDirectory(directoryConfig,function(err,directory){
    if(err){
      throw err;
    }else{
      cb(null,directory);
    }
  });
}

function createGoogleDirectory(client,cb) {
  var directoryConfig = {
    name:'protractor-test-id-site-'+uuid(),
    provider: {
      providerId: 'google',
      clientId: uuid(),
      clientSecret: uuid(),
      redirectUri: uuid(),
    }
  };
  createDirectory(client,directoryConfig,cb);
}

function createFacebookDirectory(client,cb) {
  var directoryConfig = {
    name:'protractor-test-id-site-'+uuid(),
    provider: {
      providerId: 'facebook',
      clientId: uuid(),
      clientSecret: uuid(),
      redirectUri: uuid(),
    }
  };
  createDirectory(client,directoryConfig,cb);
}

function createApplication(client,cb){
  console.log('Create Application'.blue);
  client.createApplication(
    {name:'protractor-test-id-site-'+uuid()},
    function(err,application){
      if(err){
        throw err;
      }else{
        cb(null,application);
      }
    }
  );
}


function prepeareIdSiteModel(client,currentHost,callbckUri,cb){
  console.log('WARNING! I am modifying your ID Site Configuration'.yellow);
  console.log('\tI am adding ', (browser.params.appHost+'').green , ' to your ',  'authorizedOriginUris'.yellow);
  console.log('\tI am adding ', (browser.params.callbackUri+'').green , ' to your ', 'authorizedRedirectUris'.yellow);
  console.log('\tI am adding ', (browser.params.logoUrl+'').green , ' to your ', 'logoUrl'.yellow);
  console.log('You want to remove these values from your ID Site Configuration before you launch a production application'.yellow);
  console.log('If you need a sandbox environment for testing ID Site, please contact support'.yellow);
  client.getCurrentTenant(function(err,tenant){
    if(err){
      throw err;
    }else{
      client.getResource(tenant.href + '/idSites',function(err,collection){
        if(err){
          throw err;
        }else{
          var idSiteModel = collection.items[0];
          if(idSiteModel.authorizedOriginUris.indexOf(currentHost) === -1){
            idSiteModel.authorizedOriginUris.push(currentHost);
          }
          if(idSiteModel.authorizedRedirectUris.indexOf(callbckUri) === -1){
            idSiteModel.authorizedRedirectUris.push(callbckUri);
          }
          idSiteModel.logoUrl = browser.params.logoUrl;
          idSiteModel.save(function(err){
            if(err){
              throw err;
            }else{
              cb();
            }
          });
        }
      });
    }
  });
}

function getJwtUrl(options,cb){

  var url = resources.application.createIdSiteUrl({
    callbackUri: options.callbackUri,
    path: options.path
  });

  request(url,{
    followRedirect: false
  },function(err,res,body){
    if(err){
      throw err;
    }else if(res.statusCode!==302){
      throw new Error(body&&body.message || JSON.stringify(body||'Unknown error'));
    }else{
      var fragment = res.headers.location.split('/#')[1];
      cb('#'+fragment);
    }
  });

}
function deleteResource(resource,cb){
  console.log(('Delete').blue,resource.href);
  resource.delete(cb);
}

function cleanup(cb){
  console.log('Begin Cleanup'.blue);

  var toDelete = Object.keys(resources).map(function(key){
    return resources[key];
  });

  async.each(toDelete,deleteResource,function(err){
    if(err){
      throw err;
    }else{
      console.log('Cleanup Complete'.blue);
      cb();
    }
  });
}

function mapDirectory(application,directory,isDefaultAccountStore,cb) {
  var mapping = {
    application: {
      href: application.href
    },
    accountStore: {
      href: directory.href
    },
    isDefaultAccountStore: isDefaultAccountStore
  };

  application.createAccountStoreMapping(mapping, function(err, mapping){
    if(err){
      throw err;
    }else{
      cb(mapping);
    }
  });
}

function initializeTestResources() {

  async.parallel({
    googleDirectory: createGoogleDirectory.bind(null,client),
    facebookDirectory: createFacebookDirectory.bind(null,client),
    application: createApplication.bind(null,client),
    directory: createDirectory.bind(null,client,{name:'protractor-test-id-site-'+uuid()})
  },function(err,results) {
    if(err){
      throw err;
    }else{
      resources.googleDirectory = results.googleDirectory;
      resources.facebookDirectory = results.facebookDirectory;
      resources.application = results.application;
      resources.directory = results.directory;

      async.parallel({
        idSiteModel: prepeareIdSiteModel.bind(null,client,browser.params.appHost,browser.params.callbackUri),
        account: createAccount.bind(null,resources.directory)
      },function(err,results) {
        if(err){
          throw err;
        }else{
          resources.loginAccount = results.account;
          ready = true;
        }
      });

    }
  });
}

function initializeDevApplication(cb) {
  var appHref = process.env.STORMPATH_APPLICATION_HREF;
  if(!appHref){
    throw new Error('STORMPATH_APPLICATION_HREF is not defined, you must specify an application to use for development');
  }
  client.getApplication(appHref,function(err,application) {
    if(err){
      throw err;
    }else{
      resources.application = application
      cb(null,application);
    }
  })
}

module.exports = {
  createApplication: createApplication,
  createAccount: createAccount,
  deleteResource: deleteResource,
  ready: function(){
    return ready;
  },
  resources: resources,
  getJwtUrl: getJwtUrl,
  cleanup: cleanup,
  getDirectory: function(){
    return resources.directory;
  },
  getLoginAccount: function(){
    return resources.loginAccount;
  },
  mapDirectory: mapDirectory,
  initializeTestResources: initializeTestResources,
  initializeDevApplication: initializeDevApplication
};