<?php
header("Content-Type: application/json");
require_once "db.php";

$stmt = $pdo->query("
    SELECT 
        e.*,
        COALESCE(SUM(r.attendees_count), 0) AS participants
    FROM events e
    LEFT JOIN registrations r ON e.event_id = r.event_id
    GROUP BY e.id
    ORDER BY e.event_date ASC
");

$events = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($events as &$event) {
    $event["remaining_slots"] = max(0, $event["capacity"] - $event["participants"]);
}

echo json_encode([
    "success" => true,
    "events" => $events
]);
?>