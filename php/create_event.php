<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$title = trim($data["title"] ?? "");
$date = $data["event_date"] ?? "";
$location = trim($data["location"] ?? "");
$status = $data["status"] ?? "Open";
$image = trim($data["image"] ?? "");
$capacity = (int)($data["capacity"] ?? 0);
$description = trim($data["description"] ?? "");

if (!$title || !$date || !$location || !$image || !$capacity || !$description) {
    echo json_encode(["success" => false, "message" => "All event fields are required."]);
    exit;
}

$eventId = "EVT-" . time();

$stmt = $pdo->prepare("
    INSERT INTO events (event_id, title, event_date, location, status, image, capacity, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->execute([$eventId, $title, $date, $location, $status, $image, $capacity, $description]);

echo json_encode([
    "success" => true,
    "message" => "Event created successfully."
]);
?>