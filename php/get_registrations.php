<?php
header("Content-Type: application/json");
require_once "db.php";

$stmt = $pdo->query("
    SELECT 
        r.registration_id,
        e.title AS event_title,
        r.full_name,
        r.email,
        r.ticket_type,
        r.attendees_count,
        r.registered_at
    FROM registrations r
    INNER JOIN events e ON r.event_id = e.event_id
    ORDER BY r.registered_at DESC
");

$registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "registrations" => $registrations
]);
?>