<?php 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

function generateRandomStr(int $size) {
    $str="";
    for ($i=0; $i<$size; $i++) {
        $letter=chr(65+rand(0,25));
        $makeUpper=(bool) rand(0,1);
        if ($makeUpper) $letter=strtolower($letter);
        $str.=$letter;
    }
    return $str;
}


function insertOrUpdateData(PDO $db,string $id, string $FEN) {

    $sql = "SELECT * FROM Games WHERE ID = :id LIMIT 1";
    $stmt=$db->prepare($sql);
    $stmt->bindParam(":id",$id);
    $stmt->execute();
    $res=$stmt->fetchAll();
    if (count($res)== 0) $sql = "INSERT INTO Games (ID, FEN, ACTIVE) VALUES (:id, :fen, 1)";
    else $sql="UPDATE Games SET FEN = :fen WHERE ID = :id";

    $stmt = $db->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':fen', $FEN);
    $stmt->execute();
}

function deleteData(PDO $db,string $id) {
    $sql = "DELETE FROM Games WHERE ID=:id";
    $stmt=$db->prepare($sql);
    $stmt->bindParam(":id",$id);
    $stmt->execute();
}

function createNewGame(PDO $db,string $FEN,bool $playerIsBlack,string $username) {
    $id=generateRandomStr(25);
    $playerColorToSet=($playerIsBlack) ? "B_PLR" : "W_PLR";
    $sql="INSERT INTO Games (ID,FEN,{$playerColorToSet}) VALUES (:id,:FEN,:username)";
    $data=[":id"=>$id, ":FEN"=>$FEN, ":username"=>$username];
    $stmt=$db->prepare($sql);

    $stmt->bindParam(":id",$id);
    $stmt->bindParam(":FEN",$FEN);
    $stmt->bindParam(":username",$username);

    $stmt->execute();
    return $id;
}

function getGameState(PDO $db, string $id) {
    $stmt=$db->prepare("SELECT * FROM Games WHERE ID = :id");
    $stmt->bindParam(":id",$id);
    $stmt->execute();
    $res=$stmt->fetch(PDO::FETCH_ASSOC);
    return json_encode($res);
}

function checkIfGameExists(PDO $db,string $id) {
    $stmt=$db->prepare("SELECT * FROM Games WHERE ID =:id");
    $stmt->bindParam(":id",$id);
    $stmt->execute();
    if (count($stmt->fetchAll())>0) return true;
    return false;
}

function deleteGame(PDO $db, string $id) {
    $stmt=$db->prepare("DELETE FROM Games WHERE ID = :id");
    $stmt->bindParam(":id",$id);
    $stmt->execute();
}


function handleRequest($data) {
    if (!isset($data["what"])) return false;
    $what=$data["what"];
    switch ($what) {
        case "newgame":

            break;
        
    } 
}

function loadGameDB() {
    $db= new PDO("sqlite:".__DIR__.DIRECTORY_SEPARATOR."info.db");
    return $db;
}


