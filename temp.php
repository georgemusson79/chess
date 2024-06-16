<?php
 require("mp_functions.php");
 $path="sqlite:".__DIR__.DIRECTORY_SEPARATOR."info.db";
 $db= new PDO($path);
 $game=getGame($db,"SNnjrdGTqHBexRaUHtJZIONmy");
 deleteAllGames($db);
 $id=createNewGame($db,"rnbqkbnr/ppp1pppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",true,"jesus");
 // //echo addSecondPlayer($db,"jesus2",$id);
 //updateBoard($game,$db,"obama","up");
 $res=$db->query("SELECT * FROM Games");
  print_r($res->fetchAll(PDO::FETCH_ASSOC));
  updateLastPinged($db,$id);
// $servername="sql304.infinityfree.com";
// $username="if0_36487370";
// $pass="k6OxphCd9syS";
// $dbname="if0_36487370_games_list";
// $dsn="mysql:host={$servername};dbname={$dbname};charset=utf8mb4";

// try {
//     $db=new PDO($dsn,$username,$pass);
// }
// catch (PDOException $e) {
//     echo $e->getMessage();
// }
