<?php

require_once __DIR__.'/../vendor/autoload.php';

use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseException;
use Parse\ParseQuery;

$config = require_once(__DIR__.'/../config/config.php');


$app = new Silex\Application();
$app['debug'] = true;

$initParse = function() use ($config){
  ParseClient::initialize($config['parse']['app_id'], 
                          $config['parse']['rest_key'], 
                          $config['parse']['master_key']);
};

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/templates',
));

$app->get('/changes/{id}/{parent}', function(Silex\Application $app) use ($initParse){
  $initParse();
  
  $json_response = array('status' => 0);
  
  $monObj = new ParseObject('MonSession', $app['request']->get('id'));
  $with_parent = 0;
  if($app['request']->get('id'))
  {
    $with_parent = 1;
  }
  
  $query = new ParseQuery('FileChanges');
  $query->equalTo('parent', $monObj);
  $query->descending('updatedAt');
  $results = $query->find();
  
  if(count($results) === 0)
  {
    return $app->json($json_response);
  }
  
  
  $fileChangesObj = [];
  if(count($results) > 0)
  {
    for($i = 0; $i < count($results); $i++)
    {
      $object = $results[$i];
      $fileinfo = pathinfo($object->get('filename'));
      
      $data = [
        'content'   => $object->get('content'),
        'event'     => $object->get('event'),
        'file'      => $fileinfo['filename'],
        'dir'       => $fileinfo['dirname'],
        'updatedAt' => $object->getUpdatedAt()
      ];
        
      if($with_parent)
      {
        $parent = $object->get('parent');
        $data['parent'] = $parent->fetch();
      }
      
      $fileChangesObj[] = $data;
    }
    $json_response['status'] = 1;
    $json_response['results'] = $fileChangesObj;
  }
  
  return $app->json($json_response);
})->value('parent', FALSE);

$app->get('/sessions', function(Silex\Application $app) use ($initParse){
  
  $initParse();
  
  $query = new ParseQuery('MonSession');
  $results = $query->find();
  
  $json_response = array('status' => 0);
  if(count($results) > 0)
  {
    $monSessionObj = array();
    for($i=0; $i < count($results); $i++)
    {
      $object = $results[$i];
      $monSessionObj[] = [
        'id'        => $object->getObjectId(),
        'name'      => $object->get('name'),
        'updatedAt' => $object->getUpdatedAt()
      ];
    }
    $json_response['status'] = 1;
    $json_response['results'] = $monSessionObj;
  }
  return $app->json($json_response);
});

$app->get('/', function(Silex\Application $app){
    return $app['twig']->render(
        'index.html.twig',
        array(
            'who' => 'world'
        )
    );
});

$app->run();