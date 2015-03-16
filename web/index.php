<?php

require_once __DIR__.'/../vendor/autoload.php';

use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseException;
use Parse\ParseQuery;

$config = require_once(__DIR__.'/../config/config.php');


$app = new Silex\Application();
$app['debug'] = true;

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/templates',
));

$app->get('/sessions', function(Silex\Application $app) use ($config){
  
  ParseClient::initialize($config['parse']['app_id'], 
                          $config['parse']['rest_key'], 
                          $config['parse']['master_key']);
  
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
        'name' => $object->get('name'),
        'updatedAt' => $object->getUpdatedAt()
      ];
    }
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