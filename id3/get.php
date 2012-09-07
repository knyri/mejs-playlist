<?php
$ROOT=$_SERVER['DOCUMENT_ROOT'];//change to absolute path to fix file not found errors
if(defined('__DIR__'))
	require_once(__DIR__.'/getid3/getid3.php');//5.3.0+
else
	require_once(dirname(__FILE__).'/getid3/getid3.php');
header('Content-Type: text/xml');
echo '<?xml version="1.0"?><playlist>';
$getID3 = new getID3;
$len=count($_GET)-1;
$fields=$_GET['fields'];
$fields=explode(',',$fields);
var_dump($fields);
for($i=0;$i<$len;$i++){
	echo '<item>';
	//echo $ROOT.$_GET[$i]."\n";
	$fileInfo = $getID3->analyze($ROOT.$_GET[$i]);
	getid3_lib::CopyTagsToComments($fileInfo);
	echo '<id>'.$i.'</id>';
	foreach($fields as $field){
		$field=substr($field,1,-1);
		if(isset($fileInfo['comments'][$field]))
		echo "<$field>".$fileInfo['comments'][$field][0]."</$field>";
	}
	//echo '<artist>'.$fileInfo['comments']['artist'][0].'</artist>';
	echo '</item>';
}

echo '</playlist>';