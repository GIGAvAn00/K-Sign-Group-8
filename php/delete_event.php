<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$eventId = $data["event_id"] ?? "";

if (!$eventId) {
    echo json_encode(["success" => false, "message" => "Event ID is required."]);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM events WHERE event_id = ?");
$stmt->execute([$eventId]);

echo json_encode([
    "success" => true,
    "message" => "Event deleted successfully."
]);
?>