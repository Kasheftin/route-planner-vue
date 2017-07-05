<?php

try {
	include "vendor/autoload.php";
	DB::setConfig(["route-planner"=>json_decode(join("",file("db.json")),1)]);

	$action = $_REQUEST["action"];

	if ($action=="save") {
		$data = $_REQUEST["data"];
		if (!$data) throw new Exception("Project data is not specified.");
		$data = json_decode($data,1);
		$id = $data["project"]["id"];
		$privateId = $data["project"]["privateId"];
		if (!$id) throw new Exception("ID is not specified.");
		if (!$privateId) throw new Exception("Private key is not specified.");
		unset($data["project"]["id"]);
		unset($data["project"]["privateId"]);
		$rw = DB::f1("select * from `projects` where id=?s",$id);
		if ($rw) {
			if ($rw["private_id"]==$privateId) {
				// Update current project
				DB::q("update `projects` set `data`=?s,`updated_at`=NOW() where id=?s",json_encode($data),$id);
				$out = ["type"=>"success","message"=>"Project updated."];
			}
			else {
				$out = ["type"=>"error","code"=>"privateIdMismatch","message"=>"Project's private key is incorrect."];
			}
		}
		else {
			// Insert new project
			DB::q("insert into `projects`(`id`,`private_id`,`data`,`created_at`,`updated_at`) values(?s,?s,?s,NOW(),NOW())",$id,$privateId,json_encode($data));
			$out = ["type"=>"success","message"=>"Project saved."];
		}
	}
	elseif ($action=="delete") {
		$id = $_REQUEST["id"];
		$privateId = $_REQUEST["privateId"];
		if (!$id) throw new Exception("ID is not specified.");
		if (!$privateId) throw new Exception("Private key is not specified.");
		$rw = DB::f1("select * from `projects` where id=?s",$id);
		if (!$rw) throw new Exception("Project not found.");
		if ($rw["private_id"]==$privateId) {
			DB::q("delete from `projects` where id=?s",$id);
			$out = ["type"=>"success","message"=>"Project destroyed."];
		}
		else throw new Exception("Project's private key is incorrect.");
	}
	else {
		$id = $_REQUEST["id"];
		$privateId = $_REQUEST["privateId"];
		if (!$id) throw new Exception("ID is not specified.");
		$rw = DB::f1("select * from `projects` where id=?s",$id);
		if (!$rw) throw new Exception("Project not found.");
		$data = json_decode($rw["data"],1);
		$data["project"]["id"] = $id;
		if ($privateId && ($rw["private_id"]==$privateId)) {
			$data["project"]["privateId"] = $privateId;
		}
		$out = ["type"=>"success","data"=>$data,"message"=>"Project data extracted."];
	}
	echo json_encode($out);
}
catch (Exception $e) {
	echo json_encode(["type"=>"error","message"=>$e->getMessage()]);
}
