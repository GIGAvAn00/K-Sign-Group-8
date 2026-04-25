<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "db.php";

$stmt = $pdo->query("
    SELECT 
        u.user_id,
        u.username,
        u.full_name,
        u.email,
        COUNT(r.registration_id) AS registered_events
    FROM users u
    LEFT JOIN registrations r ON u.user_id = r.user_id
    WHERE u.role = 'fan'
    GROUP BY u.id, u.user_id, u.username, u.full_name, u.email
    ORDER BY u.id DESC
");

$users = $stmt->fetchAll();

echo json_encode([
    "success" => true,
    "users" => $users
]);
?>