<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$eventId = $data["event_id"] ?? "";
$title = trim($data["title"] ?? "");
$date = $data["event_date"] ?? "";
$location = trim($data["location"] ?? "");
$status = $data["status"] ?? "Open";
$image = trim($data["image"] ?? "");
$capacity = (int)($data["capacity"] ?? 0);
$description = trim($data["description"] ?? "");

if (!$eventId || !$title || !$date || !$location || !$image || !$capacity || !$description) {
    echo json_encode(["success" => false, "message" => "All event fields are required."]);
    exit;
}

$stmt = $pdo->prepare("
    UPDATE events
    SET title = ?, event_date = ?, location = ?, status = ?, image = ?, capacity = ?, description = ?
    WHERE event_id = ?
");

$stmt->execute([$title, $date, $location, $status, $image, $capacity, $description, $eventId]);

echo json_encode([
    "success" => true,
    "message" => "Event updated successfully."
]);
?>