<?php
header("Content-Type: application/json; charset=UTF-8");
session_start();
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$identifier = trim($data["identifier"] ?? "");
$password = $data["password"] ?? "";

if ($identifier === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Login fields are required."
    ]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
$stmt->execute([$identifier, $identifier]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user["password"])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid login credentials."
    ]);
    exit;
}

$_SESSION["user_id"] = $user["user_id"];
$_SESSION["role"] = $user["role"];

echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "user" => [
        "user_id" => $user["user_id"],
        "full_name" => $user["full_name"],
        "username" => $user["username"],
        "email" => $user["email"],
        "role" => $user["role"],
        "profile_image" => $user["profile_image"]
    ]
]);
?>