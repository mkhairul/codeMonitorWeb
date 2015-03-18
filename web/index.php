<?php
//dfdffsd
require_once __DIR__.'/../vendor/autoload.php';

use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseException;
use Parse\ParseQuery;
use SebastianBergmann\Diff\Differ;

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
  
  $json_response = array('status' => 0, 'results' => []);
  
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
    if($with_parent)
    {
      $parent = $results[0]->get('parent');
      $parent->fetch();
      $parent = [
        'id'        => $parent->getObjectId(),
        'name'      => $parent->get('name'),
        'updatedAt' => $parent->getUpdatedAt()
      ];
    }
    
    $prevChanges = '';
    $prevFile = '';
    $differ = new Differ;
    $diffChanges = '';
    $granularity = new cogpowered\FineDiff\Granularity\Character;
    $diff = new cogpowered\FineDiff\Diff($granularity);
    
    for($i = 0; $i < count($results); $i++)
    {
      $object = $results[$i];
      $fileinfo = pathinfo($object->get('filename'));
      $filename = $fileinfo['filename'].'.'.$fileinfo['extension'];
      
      if($prevChanges)
      {
        if($filename != $prevFile)
        {
          $diffChanges  = '';
          $prevChanges  = $object->get('content');
          $prevFile     = $filename;
        }
        else
        {
		  //$diffChanges = $diff->render($prevChanges, $object->get('content'));
          $diffChanges = $prevChanges;
          $prevChanges = $object->get('content');
          $prevFile     = $filename;
        }
      }
      else
      {
        $prevChanges  = $object->get('content');
        $prevFile     = $filename;
      }
      
      $data = [
        'diff'      => $diffChanges,
        'content'   => $object->get('content'),
        'event'     => $object->get('event'),
        'file'      => $fileinfo['filename'].'.'.$fileinfo['extension'],
        'dir'       => $fileinfo['dirname'],
        'parent'    => $parent,
        'updatedAt' => $object->getUpdatedAt()
      ];
      
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