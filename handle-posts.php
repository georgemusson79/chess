<?php



require("mp_functions.php");
$db=loadGameDB();

class request {
    const SEND_USERNAME = 1;
}

if (isset($_POST["request"]) && isset($_POST["id"])) {
    $id=$_POST["id"];
    $err="";
    $success=false;
    $additionalData=null;
    
    switch ($_POST["request"]) {
        case request::SEND_USERNAME:
            $game=getGame($db,$id);
            if ($game) {
                $response=addSecondPlayer($db,$_POST["username"],$_POST["id"]);
                if ($response["valid"]) {
                    $success=true;
                    $additionalData=["FEN"=>$game["FEN"],"PlayerIsBlack"=>$response["playerIsBlack"]];
                }
                else $err=$response["Err"];
            }
            else $err="Game Doesn't Exist";
            break;
    }

    if ($success) {
        $data=["Error" => false, "Data" => $additionalData];
        echo json_encode($data);
    }

    else {
        $data=["Error" => true, "ErrMsg" => $err];
        echo json_encode($data);
    }
}