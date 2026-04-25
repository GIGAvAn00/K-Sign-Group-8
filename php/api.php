<?php
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

$user_id = trim($_GET['user_id'] ?? '');

if (!$user_id) {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);
    exit;
}

$sql = "
    SELECT 
        r.registration_id,
        e.title AS event_name,
        r.status,
        r.registered_at
    FROM registrations r
    JOIN events e ON r.event_id = e.event_id
    WHERE r.user_id = ?
    ORDER BY r.registered_at DESC
";

$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id]);

$data = $stmt->fetchAll();

echo json_encode([
    "success" => true,
    "registrations" => $data
]);
?>