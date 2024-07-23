<?php



require("mp_functions.php");
$db=loadGameDB();



class request {
    const SEND_USERNAME = 1;
    const CREATE_GAME = 2;
    const GET_STATE = 3;
    const SUBMIT_MOVE =4;
    const RESIGN=5;
    const GAME_OVER=6;
}


$err="Invalid params";
$success=false;
$additionalData=null;

foreach($_POST as $k => $v) {
    if ($v=="false") $_POST[$k]=false;
    if ($v=="true") $_POST[$k]=true; 

}

if (isset($_POST["request"])) {


    
    if (isset($_POST["id"])) {
        $id=$_POST["id"];
        updateLastPinged($db,$id);
        $game=getGame($db,$id);


        if ($game) {
        
            switch ($_POST["request"]) {
                case request::SEND_USERNAME:
                    $response=addSecondPlayer($db,$_POST["username"],$_POST["id"]);
                    if ($response["valid"]) {
                        $success=true;
                        $additionalData=["FEN"=>$game["FEN"],"PlayerIsBlack"=>$response["playerIsBlack"]];
                    }
                    else $err=$response["Err"];
                    break;

                case request::GET_STATE:
                    $additionalData=$game;
                    $success=true;
                    break;

                case request::SUBMIT_MOVE:

                    $FEN=$_POST["fen"];
                    $plrMove=$_POST["move"];
                    updateBoard($game,$db,$FEN,$plrMove);
                    $success=true;
                    break;

                case request::RESIGN:
                    $success=resign($db,$id);
                    break;

                case request::GAME_OVER:
                    $success=setGameOver($db,$id);
                    break;



            }

        }

        else $err="Game Doesn't Exist";
    }


    else if ($_POST["request"]==request::CREATE_GAME) {
        if (!isset($_POST["username"])) $err="Username cannot be blank.";
        else {
            $id=createNewGame($db,$_POST["fen"],$_POST["playerIsBlack"],$_POST["username"]);
            $additionalData=["id"=>$id];
            $success=true;
        }
    }

    

}


if ($success) {
    $data=["Error" => false, "Data" => $additionalData];
    echo json_encode($data);
}

else {
    $data=["Error" => true, "ErrMsg" => $err];
    echo json_encode($data);
}