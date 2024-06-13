<?php 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

class ERR {
    const GAME_DOESNT_EXIST=1;
    const PLR_NAME_TAKEN=2;
}

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

function deleteAllGames(PDO $db) {
    $sql = "DELETE FROM Games";
    $stmt=$db->prepare($sql);
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

function addSecondPlayer(PDO $db, $p2Name, $id) {
    $game=getGame($db,$id);
    if ($game) {
        $plrToSet=($game["B_PLR"]) ? "W_PLR" : "B_PLR";
        $p1=($game["B_PLR"]) ? "B_PLR" : "W_PLR";
        $playerIsBlack=($plrToSet=="B_PLR") ? true : false; 
        if ($game["B_PLR"] && $game["W_PLR"]) return ["valid"=>false,"Err"=>"Game Already Full"];
        if ($game[$p1]==$p2Name) return ["valid"=>false,"Err"=>"Name Already Taken"];


        $sql="UPDATE Games SET {$plrToSet} = :p2name WHERE ID=:id";
        $stmt=$db->prepare($sql);
        $stmt->bindParam(":id",$id);
        $stmt->bindParam(":p2name",$p2Name);
        $stmt->execute();
        return ["valid"=>true,"playerIsBlack"=>$playerIsBlack];
    }
    return false;
}

function getAllGames(PDO $db) {
    $stmt=$db->prepare("SELECT * FROM Games");
    $stmt->execute();
    $res=$stmt->fetchAll(PDO::FETCH_ASSOC);
    return json_encode($res);
}

function getGameState(PDO $db, string $id) {
    $stmt=$db->prepare("SELECT * FROM Games WHERE ID = :id");
    $stmt->bindParam(":id",$id);
    $stmt->execute();
    $res=$stmt->fetch(PDO::FETCH_ASSOC);
    return json_encode($res);
}



function getGame(PDO $db,string $id) {
    $stmt=$db->prepare("SELECT * FROM Games WHERE ID =:id");
    $stmt->bindParam(":id",$id);
    $stmt->execute();   
    $res=$stmt->fetchAll(PDO::FETCH_ASSOC);
    $total=count($res);
    if ($total>0) return $res[0];
    else return false;
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

function updateBoard($game,PDO $db,string $FEN,string $plrMove) {
    $id=$game["ID"];
    $oldFEN=$game["FEN"];
    $blackTurn=($game["IS_BLACK_TURN"]==1) ? 0 : 1;
    $sql="UPDATE Games SET OLD_FEN = :oldFEN, IS_BLACK_TURN=:blackTurn, FEN=:FEN, LAST_MOVE=:plrMove WHERE ID=:id";
    $stmt=$db->prepare($sql);
    $stmt->bindParam(":id",$id);
    $stmt->bindParam(":FEN",$FEN);
    $stmt->bindParam(":oldFEN",$oldFEN);
    $stmt->bindParam(":plrMove",$plrMove);
    $stmt->bindParam(":blackTurn",$blackTurn);
    $stmt->execute();
}


